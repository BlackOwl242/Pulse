using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Data;
using Pulse.API.Models.DTOs.Auth;
using Pulse.API.Models.Entities.Identity;
using Pulse.API.Models.Enums;
using Pulse.API.Services;
using Pulse.API.Services.Interfaces;
using System.Security.Claims;

namespace Pulse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ApplicationDbContext _db;

    public AuthController(IAuthService authService, IJwtTokenService jwtTokenService, ApplicationDbContext db)
    {
        _authService = authService;
        _jwtTokenService = jwtTokenService;
        _db = db;
    }

    /// <summary>
    /// Register a new user account (email/password)
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        return Ok(result);
    }

    /// <summary>
    /// Login with email and password (custom JWT)
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        return Ok(result);
    }

    /// <summary>
    /// Exchange KeyCloak token for Pulse JWT (Google login)
    /// Frontend gets token from KeyCloak → sends here → gets Pulse JWT back
    /// </summary>
    [HttpPost("google")]
    [Authorize(AuthenticationSchemes = "Keycloak")]
    public async Task<ActionResult<AuthResponse>> GoogleLogin()
    {
        // Extract user info from KeyCloak token claims
        var email = User.FindFirstValue(ClaimTypes.Email)
                    ?? User.FindFirstValue("email");
        var firstName = User.FindFirstValue(ClaimTypes.GivenName)
                        ?? User.FindFirstValue("given_name") ?? "";
        var lastName = User.FindFirstValue(ClaimTypes.Surname)
                       ?? User.FindFirstValue("family_name") ?? "";
        var keycloakId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                         ?? User.FindFirstValue("sub");

        if (string.IsNullOrEmpty(email))
            return BadRequest(new { message = "Email not found in KeyCloak token" });

        // Find or create user
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
        {
            // Auto-register Google user
            user = new User
            {
                Email = email,
                FirstName = firstName,
                LastName = lastName,
                Provider = AuthProvider.Google,
                ProviderId = keycloakId,
                EmailConfirmed = true, // Google email is verified
                IsActive = true,
                LastLoginAt = DateTime.UtcNow
            };
            _db.Users.Add(user);

            // Create profile
            _db.UserProfiles.Add(new Models.Entities.Organization.UserProfile
            {
                UserId = user.Id,
            });
        }
        else
        {
            user.LastLoginAt = DateTime.UtcNow;
            if (user.Provider == AuthProvider.Local)
            {
                // Link Google to existing local account
                user.ProviderId = keycloakId;
            }
        }

        // Get roles
        var roles = await _db.UserWorkspaceRoles
            .Where(uwr => uwr.UserId == user.Id)
            .Select(uwr => uwr.Role.Name)
            .Distinct()
            .ToListAsync();

        // Generate Pulse JWT
        var accessToken = _jwtTokenService.GenerateAccessToken(user, roles);
        var refreshTokenValue = _jwtTokenService.GenerateRefreshToken();

        _db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            Token = refreshTokenValue,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedByIp = HttpContext.Connection.RemoteIpAddress?.ToString()
        });

        await _db.SaveChangesAsync();

        return Ok(new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenValue,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60),
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                AvatarUrl = user.AvatarUrl
            }
        });
    }

    /// <summary>
    /// Refresh access token using refresh token
    /// </summary>
    [HttpPost("refresh-token")]
    public async Task<ActionResult<AuthResponse>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var result = await _authService.RefreshTokenAsync(request.RefreshToken);
        return Ok(result);
    }

    /// <summary>
    /// Send password reset email
    /// </summary>
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        await _authService.ForgotPasswordAsync(request.Email);
        return Ok(new { message = "If the email exists, a reset link has been sent." });
    }

    /// <summary>
    /// Reset password using token
    /// </summary>
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        await _authService.ResetPasswordAsync(request);
        return Ok(new { message = "Password has been reset successfully." });
    }
}

public class RefreshTokenRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}

public class ForgotPasswordRequest
{
    public string Email { get; set; } = string.Empty;
}
