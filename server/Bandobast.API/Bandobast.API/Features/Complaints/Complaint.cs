using Bandobast.API.Features.Areas;
using Bandobast.API.Features.Auth;
using System.ComponentModel.DataAnnotations;

namespace Bandobast.API.Features.Complaints;

public class Complaint
{
    public int Id { get; set; }
    
    [MaxLength(50)]
    public string PublicReferenceId { get; set; } = string.Empty; // e.g. BND-2026-XXXXXX
    
    public int UserId { get; set; }
    public User? User { get; set; }
    
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty; // INFRASTRUCTURE, FOOD, MEDICINE, DRUG
    
    [MaxLength(100)]
    public string Type { get; set; } = string.Empty; // e.g. POWER, WATER, ADULTERATED
    
    [MaxLength(200)]
    public string? Title { get; set; }
    
    [MaxLength(2000)]
    public string? Description { get; set; }
    
    public int? LocalityId { get; set; }
    public Locality? Locality { get; set; }
    
    [MaxLength(500)]
    public string? SpecificLocation { get; set; }
    
    [MaxLength(50)]
    public string Status { get; set; } = "SUBMITTED";
    
    [MaxLength(1000)]
    public string? EvidenceUrl { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }
    
    public string? AdminNotes { get; set; }

    // Gamification
    public int VouchCount { get; set; } = 0;
    public ICollection<ComplaintVouch> Vouches { get; set; } = new List<ComplaintVouch>();
}
