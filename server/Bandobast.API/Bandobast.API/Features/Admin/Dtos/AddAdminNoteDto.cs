using System.ComponentModel.DataAnnotations;

namespace Bandobast.API.Features.Admin.Dtos;

public class AddAdminNoteDto
{
    [Required]
    public string Note { get; set; } = string.Empty;
}
