using System.ComponentModel.DataAnnotations;
using Bandobast.API.Features.Auth;
using Bandobast.API.Features.Complaints;

namespace Bandobast.API.Features.Notifications;

public class Notification
{
    public int Id { get; set; }

    public int ComplaintId { get; set; }
    public Complaint? Complaint { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    /// <summary>EMAIL or SMS</summary>
    [MaxLength(10)]
    public string Type { get; set; } = string.Empty;

    /// <summary>PENDING | SENT | FAILED | RETRYING</summary>
    [MaxLength(20)]
    public string Status { get; set; } = NotificationStatus.Pending;

    /// <summary>Masked recipient — e.g. u***@gmail.com or +91 XXXXX 56789</summary>
    [MaxLength(200)]
    public string Recipient { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Provider { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? ProviderMessageId { get; set; }

    [MaxLength(2000)]
    public string? ErrorMessage { get; set; }

    /// <summary>Number of delivery attempts made (max 3)</summary>
    public int Attempts { get; set; } = 0;

    public DateTime? SentAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public static class NotificationStatus
{
    public const string Pending = "PENDING";
    public const string Sent = "SENT";
    public const string Failed = "FAILED";
    public const string Retrying = "RETRYING";
}

public static class NotificationType
{
    public const string Email = "EMAIL";
    public const string Sms = "SMS";
}
