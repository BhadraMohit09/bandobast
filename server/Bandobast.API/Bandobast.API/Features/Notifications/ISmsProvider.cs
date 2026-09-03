namespace Bandobast.API.Features.Notifications;

public interface ISmsProvider
{
    Task<(bool Success, string? MessageSid, string? Error)> SendAsync(string toNumber, string message);
}
