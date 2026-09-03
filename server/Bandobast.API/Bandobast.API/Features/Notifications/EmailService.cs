using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace Bandobast.API.Features.Notifications;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task<(bool Success, string? Error)> SendAsync(EmailMessage message)
    {
        var host = _config["Email:Host"];
        var portStr = _config["Email:Port"];
        var username = _config["Email:Username"];
        var password = _config["Email:Password"];
        // If no From address is configured, use the SMTP username (required for Gmail)
        var fromAddress = _config["Email:From"] is { Length: > 0 } f ? f : username;
        var fromName = _config["Email:DisplayName"] is { Length: > 0 } n ? n : "Bandobast";

        if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        {
            _logger.LogWarning("Email is not configured. Skipping email to {To}", MaskEmail(message.ToEmail));
            return (false, "Email provider is not configured.");
        }

        if (!int.TryParse(portStr, out int port))
            port = 587;

        try
        {
            var mime = new MimeMessage();
            mime.From.Add(new MailboxAddress(fromName, fromAddress ?? username!));
            mime.To.Add(new MailboxAddress(message.ToName, message.ToEmail));
            mime.Subject = message.Subject;

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = message.HtmlBody,
                TextBody = message.PlainTextBody
            };
            mime.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(host, port, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(username, password);
            await client.SendAsync(mime);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Email sent successfully to {To}", MaskEmail(message.ToEmail));
            return (true, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}", MaskEmail(message.ToEmail));
            return (false, ex.Message);
        }
    }

    private static string MaskEmail(string email)
    {
        var atIndex = email.IndexOf('@');
        if (atIndex <= 1) return "***@***";
        return email[0] + "***" + email[atIndex..];
    }
}
