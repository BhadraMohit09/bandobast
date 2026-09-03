using System.ComponentModel.DataAnnotations;

namespace Bandobast.API.Features.Outages.Dtos;

public class CreateOutageDto
{
	[Required]
	public int LocalityId { get; set; }

	[Required]
	public OutageType Type { get; set; }
}