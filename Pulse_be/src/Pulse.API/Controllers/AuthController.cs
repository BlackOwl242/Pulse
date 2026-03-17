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
    private readonly IWebHostEnvironment _env;

    public AuthController(IAuthService authService, IJwtTokenService jwtTokenService, ApplicationDbContext db, IWebHostEnvironment env)
    {
        _authService = authService;
        _jwtTokenService = jwtTokenService;
        _db = db;
        _env = env;
    }

    /// <summary>
    /// Register a new user account (email/password)
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        SetRefreshTokenCookie(result.RefreshToken);
        result.RefreshToken = null!; // Don't send refresh token in response body
        return Ok(result);
    }

    /// <summary>
    /// Login with email and password (custom JWT)
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        SetRefreshTokenCookie(result.RefreshToken);
        result.RefreshToken = null!; // Don't send refresh token in response body
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

            // Auto-create default workspace and assign Admin role
            var workspaceName = $"{firstName}'s Workspace";
            var wsSlug = workspaceName.ToLowerInvariant();
            wsSlug = System.Text.RegularExpressions.Regex.Replace(wsSlug, @"[^a-z0-9\s-]", "");
            wsSlug = System.Text.RegularExpressions.Regex.Replace(wsSlug, @"\s+", "-");
            wsSlug = System.Text.RegularExpressions.Regex.Replace(wsSlug, @"-+", "-");
            wsSlug = $"{wsSlug.Trim('-')}-{Guid.NewGuid().ToString("N")[..6]}";

            var workspace = new Models.Entities.Organization.Workspace
            {
                Name = workspaceName,
                Slug = wsSlug,
                Description = "My personal workspace",
                OwnerId = user.Id,
                CreatedById = user.Id,
            };
            _db.Workspaces.Add(workspace);

            var adminRole = await _db.Roles.FirstAsync(r => r.Name == "Admin" && r.IsSystem);
            _db.UserWorkspaceRoles.Add(new UserWorkspaceRole
            {
                UserId = user.Id,
                WorkspaceId = workspace.Id,
                RoleId = adminRole.Id
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

        SetRefreshTokenCookie(refreshTokenValue);

        return Ok(new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = null!, // Don't send refresh token in response body
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
    /// Refresh access token using refresh token from httpOnly cookie
    /// </summary>
    [HttpPost("refresh-token")]
    public async Task<ActionResult<AuthResponse>> RefreshToken([FromBody] RefreshTokenRequest? request = null)
    {
        // Read refresh token from httpOnly cookie first, fallback to body for backward compat
        var refreshToken = Request.Cookies["pulse_refresh_token"] ?? request?.RefreshToken;

        if (string.IsNullOrEmpty(refreshToken))
            return Unauthorized(new { message = "No refresh token provided" });

        var result = await _authService.RefreshTokenAsync(refreshToken);
        SetRefreshTokenCookie(result.RefreshToken);
        result.RefreshToken = null!; // Don't send refresh token in response body
        return Ok(result);
    }

    /// <summary>
    /// Logout — clear refresh token cookie
    /// </summary>
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("pulse_refresh_token", new CookieOptions
        {
            Path = "/",
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Lax
        });
        return Ok(new { message = "Logged out" });
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

    /// <summary>
    /// Change password for authenticated users
    /// </summary>
    [HttpPut("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
            return Unauthorized();

        await _authService.ChangePasswordAsync(userId, request);
        return Ok(new { message = "Password updated successfully." });
    }

    // ===== Helpers =====

    private void SetRefreshTokenCookie(string refreshToken)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = !_env.IsDevelopment(),  // false for localhost, true in production
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddDays(7),
            Path = "/",
        };
        Response.Cookies.Append("pulse_refresh_token", refreshToken, cookieOptions);
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
