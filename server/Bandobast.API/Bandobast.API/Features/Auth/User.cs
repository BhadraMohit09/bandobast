namespace Bandobast.API.Features.Auth;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? ProfilePhotoUrl { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Bio { get; set; }
    public int? PreferredLocalityId { get; set; }
    public Bandobast.API.Features.Areas.Locality? PreferredLocality { get; set; }
    public string Role { get; set; } = "USER";
    
    // Email Verification fields
    public bool IsEmailVerified { get; set; } = false;
    public string? EmailVerificationOtp { get; set; }
    public DateTime? EmailVerificationOtpExpiry { get; set; }

    // Password Reset fields
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetTokenExpiry { get; set; }

    // Gamification & Monetization
    public int CivicPoints { get; set; } = 0;
    public bool IsVerified { get; set; } = false;
    public ICollection<UserBadge> Badges { get; set; } = new List<UserBadge>();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
