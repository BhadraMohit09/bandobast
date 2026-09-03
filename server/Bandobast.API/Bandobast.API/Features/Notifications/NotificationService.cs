using Bandobast.API.Data;
using Bandobast.API.Features.Auth;
using Bandobast.API.Features.Complaints;
using Microsoft.EntityFrameworkCore;

namespace Bandobast.API.Features.Notifications;

public class NotificationService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IEmailService _emailService;
    private readonly ISmsProvider _smsProvider;
    private readonly EmailTemplateService _templateService;
    private readonly IConfiguration _config;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        IServiceScopeFactory scopeFactory,
        IEmailService emailService,
        ISmsProvider smsProvider,
        EmailTemplateService templateService,
        IConfiguration config,
        ILogger<NotificationService> logger)
    {
        _scopeFactory = scopeFactory;
        _emailService = emailService;
        _smsProvider = smsProvider;
        _templateService = templateService;
        _config = config;
        _logger = logger;
    }

    /// <summary>
    /// Sends email and SMS confirmation for a newly submitted report.
    /// This method never throws — all failures are caught and recorded.
    /// </summary>
    public async Task SendReportConfirmationAsync(Complaint complaint, User user, string? localityName)
    {
        _logger.LogInformation("Sending report confirmation notifications for {ReportId}", complaint.PublicReferenceId);

        var baseUrl = _config["App:BaseUrl"]?.TrimEnd('/') ?? "https://localhost:3000";
        var trackingUrl = $"{baseUrl}/profile";

        var location = BuildLocationString(localityName, complaint.SpecificLocation);
        var categoryLabel = FormatCategoryLabel(complaint.Category);
        var typeLabel = FormatTypeLabel(complaint.Type);

        // Create PENDING notification records upfront (so we always have an audit trail)
        var emailNotif = await CreateNotificationRecord(
            complaint.Id, user.Id, NotificationType.Email,
            MaskEmail(user.Email), "MailKit");

        // Only create SMS notification if user has a phone number
        Notification? smsNotif = null;
        if (!string.IsNullOrWhiteSpace(user.PhoneNumber))
        {
            smsNotif = await CreateNotificationRecord(
                complaint.Id, user.Id, NotificationType.Sms,
                MaskPhone(user.PhoneNumber), "Twilio");
        }
        else
        {
            _logger.LogInformation("User {UserId} has no phone number. Skipping SMS for {ReportId}",
                user.Id, complaint.PublicReferenceId);
        }

        // Build email content
        var emailData = new ReportEmailData(
            UserName: user.DisplayName,
            ReportId: complaint.PublicReferenceId,
            Category: categoryLabel,
            Type: typeLabel,
            SubmittedOn: complaint.CreatedAt,
            Location: location,
            Description: complaint.Description,
            Status: complaint.Status,
            TrackingUrl: trackingUrl
        );

        var emailMsg = new EmailMessage(
            ToEmail: user.Email,
            ToName: user.DisplayName,
            Subject: $"Bandobast — Report Submitted Successfully | {complaint.PublicReferenceId}",
            HtmlBody: _templateService.BuildReportSubmittedHtml(emailData),
            PlainTextBody: _templateService.BuildReportSubmittedPlainText(emailData)
        );

        // Fire email and SMS concurrently (both inside try-catch)
        var emailTask = SendEmailWithTracking(emailMsg, emailNotif);
        var smsTask = smsNotif != null
            ? SendSmsWithTracking(user.PhoneNumber!, complaint.PublicReferenceId, categoryLabel, smsNotif)
            : Task.CompletedTask;

        await Task.WhenAll(emailTask, smsTask);

        _logger.LogInformation("Notification dispatch complete for {ReportId}", complaint.PublicReferenceId);
    }

    /// <summary>
    /// Retries a specific FAILED notification. Used by the retry worker.
    /// </summary>
    public async Task RetryNotificationAsync(int notificationId)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var notif = await db.Notifications
            .Include(n => n.Complaint)
            .Include(n => n.User)
            .FirstOrDefaultAsync(n => n.Id == notificationId);

        if (notif?.Complaint == null || notif.User == null)
        {
            _logger.LogWarning("RetryNotification: notification {Id} not found or missing relations", notificationId);
            return;
        }

        notif.Status = NotificationStatus.Retrying;
        notif.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        if (notif.Type == NotificationType.Email)
        {
            var baseUrl = _config["App:BaseUrl"]?.TrimEnd('/') ?? "https://localhost:3000";
            var location = BuildLocationString(notif.Complaint.Locality?.Name, notif.Complaint.SpecificLocation);
            var emailData = new ReportEmailData(
                UserName: notif.User.DisplayName,
                ReportId: notif.Complaint.PublicReferenceId,
                Category: FormatCategoryLabel(notif.Complaint.Category),
                Type: FormatTypeLabel(notif.Complaint.Type),
                SubmittedOn: notif.Complaint.CreatedAt,
                Location: location,
                Description: notif.Complaint.Description,
                Status: notif.Complaint.Status,
                TrackingUrl: $"{baseUrl}/profile"
            );

            var emailMsg = new EmailMessage(
                ToEmail: notif.User.Email,
                ToName: notif.User.DisplayName,
                Subject: $"Bandobast — Report Submitted Successfully | {notif.Complaint.PublicReferenceId}",
                HtmlBody: _templateService.BuildReportSubmittedHtml(emailData),
                PlainTextBody: _templateService.BuildReportSubmittedPlainText(emailData)
            );

            await SendEmailWithTrackingDirect(emailMsg, notif, db);
        }
        else if (notif.Type == NotificationType.Sms && !string.IsNullOrWhiteSpace(notif.User.PhoneNumber))
        {
            await SendSmsWithTrackingDirect(
                notif.User.PhoneNumber,
                notif.Complaint.PublicReferenceId,
                FormatCategoryLabel(notif.Complaint.Category),
                notif, db);
        }
    }

    // ─── Private helpers ────────────────────────────────────────────────────

    private async Task SendEmailWithTracking(EmailMessage msg, Notification notif)
    {
        try
        {
            var (success, error) = await _emailService.SendAsync(msg);
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await UpdateNotificationResult(db, notif.Id, success, null, error);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during email delivery for notification {Id}", notif.Id);
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await UpdateNotificationResult(db, notif.Id, false, null, ex.Message);
        }
    }

    private async Task SendEmailWithTrackingDirect(EmailMessage msg, Notification notif, AppDbContext db)
    {
        try
        {
            var (success, error) = await _emailService.SendAsync(msg);
            await UpdateNotificationResult(db, notif.Id, success, null, error);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during email retry for notification {Id}", notif.Id);
            await UpdateNotificationResult(db, notif.Id, false, null, ex.Message);
        }
    }

    private async Task SendSmsWithTracking(string phoneNumber, string reportId, string category, Notification notif)
    {
        try
        {
            var smsBody = _templateService.BuildReportSubmittedSms(reportId, category);
            var (success, messageSid, error) = await _smsProvider.SendAsync(phoneNumber, smsBody);
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await UpdateNotificationResult(db, notif.Id, success, messageSid, error);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during SMS delivery for notification {Id}", notif.Id);
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await UpdateNotificationResult(db, notif.Id, false, null, ex.Message);
        }
    }

    private async Task SendSmsWithTrackingDirect(string phoneNumber, string reportId, string category, Notification notif, AppDbContext db)
    {
        try
        {
            var smsBody = _templateService.BuildReportSubmittedSms(reportId, category);
            var (success, messageSid, error) = await _smsProvider.SendAsync(phoneNumber, smsBody);
            await UpdateNotificationResult(db, notif.Id, success, messageSid, error);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during SMS retry for notification {Id}", notif.Id);
            await UpdateNotificationResult(db, notif.Id, false, null, ex.Message);
        }
    }

    private async Task<Notification> CreateNotificationRecord(
        int complaintId, int userId, string type, string maskedRecipient, string provider)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var notif = new Notification
        {
            ComplaintId = complaintId,
            UserId = userId,
            Type = type,
            Status = NotificationStatus.Pending,
            Recipient = maskedRecipient,
            Provider = provider,
            Attempts = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Notifications.Add(notif);
        await db.SaveChangesAsync();
        return notif;
    }

    private static async Task UpdateNotificationResult(
        AppDbContext db, int notificationId, bool success, string? providerMessageId, string? error)
    {
        var notif = await db.Notifications.FindAsync(notificationId);
        if (notif == null) return;

        notif.Attempts++;
        notif.UpdatedAt = DateTime.UtcNow;
        notif.ProviderMessageId = providerMessageId;

        if (success)
        {
            notif.Status = NotificationStatus.Sent;
            notif.SentAt = DateTime.UtcNow;
            notif.ErrorMessage = null;
        }
        else
        {
            notif.Status = NotificationStatus.Failed;
            notif.ErrorMessage = error;
        }

        await db.SaveChangesAsync();
    }

    private static string BuildLocationString(string? localityName, string? specificLocation)
    {
        var parts = new List<string>();
        if (!string.IsNullOrWhiteSpace(localityName)) parts.Add(localityName);
        if (!string.IsNullOrWhiteSpace(specificLocation)) parts.Add(specificLocation);
        return parts.Count > 0 ? string.Join(", ", parts) : string.Empty;
    }

    private static string FormatCategoryLabel(string category) => category switch
    {
        "FOOD" => "Food Safety",
        "MEDICINE" => "Medicine Safety",
        "DRUG" => "Drug Safety",
        "INFRASTRUCTURE" => "Infrastructure",
        _ => category
    };

    private static string FormatTypeLabel(string type) =>
        type.Replace("_", " ").ToLowerInvariant() is string s
            ? char.ToUpper(s[0]) + s[1..]
            : type;

    private static string MaskEmail(string email)
    {
        var atIndex = email.IndexOf('@');
        if (atIndex <= 1) return "***@***";
        return email[0] + "***" + email[atIndex..];
    }

    private static string MaskPhone(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone) || phone.Length < 5) return "***";
        return phone[..3] + "XXXXX" + phone[^4..];
    }
}
