using System.ComponentModel.DataAnnotations;

namespace Bandobast.API.Features.Complaints.Dtos;

public class CreateComplaintDto
{
    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Type { get; set; } = string.Empty;
    
    [MaxLength(200)]
    public string? Title { get; set; }
    
    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;
    
    public int? LocalityId { get; set; }
    
    [MaxLength(500)]
    public string? SpecificLocation { get; set; }
    
    [MaxLength(1000)]
    public string? EvidenceUrl { get; set; }
}
