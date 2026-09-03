namespace Bandobast.API.Features.Complaints.Dtos;

public class ComplaintResponseDto
{
    public int Id { get; set; }
    public string PublicReferenceId { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Title { get; set; }
    public string? Description { get; set; }
    public int? LocalityId { get; set; }
    public string? LocalityName { get; set; }
    public string? SpecificLocation { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? EvidenceUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public int VouchCount { get; set; }
    public string? SubmitterName { get; set; }
    public bool SubmitterIsVerified { get; set; }
}
