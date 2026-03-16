using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Pulse.API.Services.Interfaces;

namespace Pulse.API.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendInvitationEmailAsync(string toEmail, string workspaceName, string inviteLink)
    {
        // For now, just log it. (Or we could send a generic invite via SMTP).
        _logger.LogInformation($"[EMAIL MOCK] Invite to {workspaceName} sent to: {toEmail} | Link: {inviteLink}");
        await Task.CompletedTask;
    }

    public async Task SendPasswordResetEmailAsync(string email, string resetLink)
    {
        var smtpServer = _config["EmailConfiguration:SmtpServer"];
        var portStr = _config["EmailConfiguration:Port"];
        var port = int.TryParse(portStr, out int p) ? p : 587;
        var username = _config["EmailConfiguration:Username"];
        var password = _config["EmailConfiguration:Password"];
        var fromEmail = _config["EmailConfiguration:FromEmail"] ?? "noreply@pulse.com";
        var fromName = _config["EmailConfiguration:FromName"] ?? "Pulse App";

        // In development, if SMTP isn't really configured, just log to console
        if (string.IsNullOrEmpty(smtpServer) || smtpServer == "smtp.example.com" || smtpServer == "your_smtp_server")
        {
            _logger.LogWarning($"[EMAIL MOCK] To: {email} | Reset Link: {resetLink}");
            return;
        }

        try
        {
            using var client = new SmtpClient(smtpServer, port)
            {
                Credentials = new NetworkCredential(username, password),
                EnableSsl = true
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail, fromName),
                Subject = "Pulse App - Password Reset Request",
                Body = $"<p>You requested a password reset.</p><p>Click the link below to reset your password:</p><p><a href='{resetLink}'>{resetLink}</a></p><p>This link will expire in 1 hour. If you did not request this, please ignore this email.</p>",
                IsBodyHtml = true
            };
            mailMessage.To.Add(email);

            await client.SendMailAsync(mailMessage);
            _logger.LogInformation($"Password reset email sent to {email}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to send password reset email to {email}");
            // We might log it but not fail the whole request so the user isn't stuck if SMTP is briefly down,
            // or we could rethrow. Logging is safer.
        }
    }
}
