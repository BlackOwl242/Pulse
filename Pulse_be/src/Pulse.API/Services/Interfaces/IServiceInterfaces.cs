using Pulse.API.Models.DTOs.Auth;
using Pulse.API.Models.Enums;

namespace Pulse.API.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RefreshTokenAsync(string refreshToken);
    Task ForgotPasswordAsync(string email);
    Task ResetPasswordAsync(ResetPasswordRequest request);
    Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request);
}

public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Email { get; }
    bool IsAuthenticated { get; }
}

public interface IEmailService
{
    Task SendInvitationEmailAsync(string toEmail, string workspaceName, string inviteLink);
    Task SendPasswordResetEmailAsync(string toEmail, string resetLink);
}

public interface IFileStorageService
{
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType);
    Task DeleteFileAsync(string fileUrl);
    Task<Stream?> DownloadFileAsync(string fileUrl);
}

public interface ICacheService
{
    Task<T?> GetAsync<T>(string key);
    Task SetAsync<T>(string key, T value, TimeSpan? expiration = null);
    Task RemoveAsync(string key);
}

public interface IWebhookService
{
    Task SendWebhookAsync(string eventType, object payload);
}

public interface INotificationService
{
    Task SendAsync(Guid userId, Guid workspaceId, NotificationType type,
                   string title, string? content = null,
                   string? entityType = null, Guid? entityId = null, Guid? actorId = null);
}
