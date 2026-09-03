using System.ComponentModel.DataAnnotations;

namespace Bandobast.API.Features.Admin.Dtos;

public class UpdateComplaintStatusDto
{
    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = string.Empty;
}
