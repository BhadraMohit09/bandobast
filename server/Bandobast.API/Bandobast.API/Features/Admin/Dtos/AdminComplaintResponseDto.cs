using Bandobast.API.Features.Complaints.Dtos;

namespace Bandobast.API.Features.Admin.Dtos;

public class AdminComplaintResponseDto : ComplaintResponseDto
{
    public string? AdminNotes { get; set; }
    public string UserEmail { get; set; } = string.Empty;
    public string UserDisplayName { get; set; } = string.Empty;
}
