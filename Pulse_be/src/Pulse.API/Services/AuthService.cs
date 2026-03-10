using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Data;
using Pulse.API.Models.DTOs.Auth;
using Pulse.API.Models.Entities.Identity;
using Pulse.API.Models.Entities.Organization;
using Pulse.API.Models.Enums;
using Pulse.API.Services.Interfaces;

namespace Pulse.API.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _db;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthService(ApplicationDbContext db, IJwtTokenService jwtTokenService)
    {
        _db = db;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        // Check if user already exists
        var existingUser = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (existingUser != null)
            throw new InvalidOperationException("Email is already registered.");

        // Hash password
        var passwordHash = HashPassword(request.Password);

        var user = new User
        {
            Email = request.Email,
            PasswordHash = passwordHash,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Provider = AuthProvider.Local,
            EmailConfirmed = false,
            IsActive = true,
            LastLoginAt = DateTime.UtcNow
        };

        _db.Users.Add(user);

        // Create empty profile
        _db.UserProfiles.Add(new UserProfile { UserId = user.Id });

        // Generate tokens
        var accessToken = _jwtTokenService.GenerateAccessToken(user, new List<string>());
        var refreshTokenValue = _jwtTokenService.GenerateRefreshToken();

        _db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            Token = refreshTokenValue,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
        });

        await _db.SaveChangesAsync();

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenValue,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60),
            User = MapToDto(user)
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null || user.PasswordHash == null)
            throw new UnauthorizedAccessException("Invalid email or password.");

        if (!VerifyPassword(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Account is deactivated.");

        user.LastLoginAt = DateTime.UtcNow;

        // Get roles
        var roles = await _db.UserWorkspaceRoles
            .Where(uwr => uwr.UserId == user.Id)
            .Select(uwr => uwr.Role.Name)
            .Distinct()
            .ToListAsync();

        var accessToken = _jwtTokenService.GenerateAccessToken(user, roles);
        var refreshTokenValue = _jwtTokenService.GenerateRefreshToken();

        _db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            Token = refreshTokenValue,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
        });

        await _db.SaveChangesAsync();

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenValue,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60),
            User = MapToDto(user)
        };
    }

    public async Task<AuthResponse> RefreshTokenAsync(string refreshToken)
    {
        var storedToken = await _db.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

        if (storedToken == null || !storedToken.IsActive)
            throw new UnauthorizedAccessException("Invalid or expired refresh token.");

        // Revoke old token
        storedToken.RevokedAt = DateTime.UtcNow;

        // Get roles
        var roles = await _db.UserWorkspaceRoles
            .Where(uwr => uwr.UserId == storedToken.UserId)
            .Select(uwr => uwr.Role.Name)
            .Distinct()
            .ToListAsync();

        // Generate new tokens
        var newAccessToken = _jwtTokenService.GenerateAccessToken(storedToken.User, roles);
        var newRefreshTokenValue = _jwtTokenService.GenerateRefreshToken();

        storedToken.ReplacedByToken = newRefreshTokenValue;

        _db.RefreshTokens.Add(new RefreshToken
        {
            UserId = storedToken.UserId,
            Token = newRefreshTokenValue,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
        });

        await _db.SaveChangesAsync();

        return new AuthResponse
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshTokenValue,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60),
            User = MapToDto(storedToken.User)
        };
    }

    public async Task ForgotPasswordAsync(string email)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return; // Don't reveal if email exists

        var token = new PasswordResetToken
        {
            UserId = user.Id,
            Token = Guid.NewGuid().ToString("N"),
            ExpiresAt = DateTime.UtcNow.AddHours(1),
        };

        _db.PasswordResetTokens.Add(token);
        await _db.SaveChangesAsync();

        // TODO: Send email via IEmailService with reset link
        // await _emailService.SendPasswordResetEmailAsync(email, $"https://app.pulse.com/reset-password?token={token.Token}");
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request)
    {
        var resetToken = await _db.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Token == request.Token && !t.IsUsed && t.ExpiresAt > DateTime.UtcNow);

        if (resetToken == null)
            throw new ArgumentException("Invalid or expired reset token.");

        resetToken.User.PasswordHash = HashPassword(request.NewPassword);
        resetToken.IsUsed = true;

        await _db.SaveChangesAsync();
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            throw new KeyNotFoundException("User not found.");

        if (user.PasswordHash == null || !VerifyPassword(request.CurrentPassword, user.PasswordHash))
            throw new UnauthorizedAccessException("Current password is incorrect.");

        user.PasswordHash = HashPassword(request.NewPassword);
        await _db.SaveChangesAsync();
    }

    // ===== Helpers =====

    private static string HashPassword(string password)
    {
        var salt = new byte[16];
        using (var rng = RandomNumberGenerator.Create())
            rng.GetBytes(salt);

        var hash = new Rfc2898DeriveBytes(password, salt, 100_000, HashAlgorithmName.SHA256);
        var hashBytes = hash.GetBytes(32);

        var combined = new byte[48];
        Array.Copy(salt, 0, combined, 0, 16);
        Array.Copy(hashBytes, 0, combined, 16, 32);

        return Convert.ToBase64String(combined);
    }

    private static bool VerifyPassword(string password, string storedHash)
    {
        var combined = Convert.FromBase64String(storedHash);
        var salt = new byte[16];
        Array.Copy(combined, 0, salt, 0, 16);

        var hash = new Rfc2898DeriveBytes(password, salt, 100_000, HashAlgorithmName.SHA256);
        var hashBytes = hash.GetBytes(32);

        for (int i = 0; i < 32; i++)
        {
            if (combined[i + 16] != hashBytes[i]) return false;
        }
        return true;
    }

    private static UserDto MapToDto(User user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        FirstName = user.FirstName,
        LastName = user.LastName,
        AvatarUrl = user.AvatarUrl
    };
}
