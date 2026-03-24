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
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _httpClientFactory;

    public AuthController(IAuthService authService, IJwtTokenService jwtTokenService, ApplicationDbContext db, IWebHostEnvironment env, IConfiguration config, IHttpClientFactory httpClientFactory)
    {
        _authService = authService;
        _jwtTokenService = jwtTokenService;
        _db = db;
        _env = env;
        _config = config;
        _httpClientFactory = httpClientFactory;
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
    /// Exchange KeyCloak authorization code for Pulse JWT (Google login)
    /// </summary>
    [HttpPost("google")]
    public async Task<ActionResult<AuthResponse>> GoogleLogin([FromBody] GoogleLoginRequest request)
    {
        // Exchange code for Keycloak token
        var authority = _config["Keycloak:Authority"]?.TrimEnd('/');
        var clientId = _config["Keycloak:Audience"] ?? "pulse-client";
        var clientSecret = _config["Keycloak:ClientSecret"];
        
        var tokenEndpoint = $"{authority}/protocol/openid-connect/token";
        
        using var client = _httpClientFactory.CreateClient();
        var tokenResponse = await client.PostAsync(tokenEndpoint, new FormUrlEncodedContent(new Dictionary<string, string>
        {
            { "grant_type", "authorization_code" },
            { "client_id", clientId },
            { "client_secret", clientSecret! },
            { "code", request.Code },
            { "redirect_uri", request.RedirectUri }
        }));

        if (!tokenResponse.IsSuccessStatusCode)
        {
            var err = await tokenResponse.Content.ReadAsStringAsync();
            return BadRequest(new { message = "Failed to exchange authorization code with Keycloak.", details = err });
        }

        var tokenJson = await tokenResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        var keycloakAccessToken = tokenJson.GetProperty("access_token").GetString();

        if (string.IsNullOrEmpty(keycloakAccessToken))
            return BadRequest(new { message = "Access token missing from Keycloak response." });

        // Decode the JWT to read claims
        var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
        var jwtToken = tokenHandler.ReadJwtToken(keycloakAccessToken);

        var email = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email || c.Type == "email")?.Value;
        var firstName = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.GivenName || c.Type == "given_name")?.Value ?? "";
        var lastName = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Surname || c.Type == "family_name")?.Value ?? "";
        var keycloakId = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier || c.Type == "sub")?.Value;

        if (string.IsNullOrEmpty(email))
            return BadRequest(new { message = "Email not found in KeyCloak token." });

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

public class GoogleLoginRequest
{
    public string Code { get; set; } = string.Empty;
    public string RedirectUri { get; set; } = string.Empty;
}
