using Twilio;
using Twilio.Rest.Api.V2010.Account;

namespace Bandobast.API.Features.Notifications;

public class TwilioSmsProvider : ISmsProvider
{
    private readonly IConfiguration _config;
    private readonly ILogger<TwilioSmsProvider> _logger;

    public TwilioSmsProvider(IConfiguration config, ILogger<TwilioSmsProvider> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task<(bool Success, string? MessageSid, string? Error)> SendAsync(string toNumber, string message)
    {
        var accountSid = _config["Sms:AccountSid"];
        var authToken = _config["Sms:AuthToken"];
        var fromNumber = _config["Sms:FromNumber"];

        if (string.IsNullOrWhiteSpace(accountSid) || string.IsNullOrWhiteSpace(authToken) || string.IsNullOrWhiteSpace(fromNumber))
        {
            _logger.LogWarning("SMS (Twilio) is not configured. Skipping SMS to {To}", MaskPhone(toNumber));
            return (false, null, "SMS provider is not configured.");
        }

        if (string.IsNullOrWhiteSpace(toNumber))
        {
            _logger.LogWarning("SMS skipped — user has no phone number on record.");
            return (false, null, "No phone number on record.");
        }

        try
        {
            TwilioClient.Init(accountSid, authToken);

            var msg = await MessageResource.CreateAsync(
                body: message,
                from: new Twilio.Types.PhoneNumber(fromNumber),
                to: new Twilio.Types.PhoneNumber(toNumber)
            );

            _logger.LogInformation("SMS sent successfully to {To}. SID: {Sid}", MaskPhone(toNumber), msg.Sid);
            return (true, msg.Sid, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send SMS to {To}", MaskPhone(toNumber));
            return (false, null, ex.Message);
        }
    }

    private static string MaskPhone(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone) || phone.Length < 5) return "***";
        // Show first 3 and last 4 chars, mask the middle
        return phone[..3] + "XXXXX" + phone[^4..];
    }
}
