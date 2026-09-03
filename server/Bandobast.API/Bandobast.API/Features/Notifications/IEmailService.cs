namespace Bandobast.API.Features.Notifications;

public interface IEmailService
{
    Task<(bool Success, string? Error)> SendAsync(EmailMessage message);
}

public record EmailMessage(
    string ToEmail,
    string ToName,
    string Subject,
    string HtmlBody,
    string PlainTextBody
);
