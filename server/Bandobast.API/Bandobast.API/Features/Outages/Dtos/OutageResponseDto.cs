namespace Bandobast.API.Features.Outages.Dtos;

public class OutageResponseDto
{
	public int Id { get; set; }
	public int LocalityId { get; set; }
	public string LocalityName { get; set; } = string.Empty;
	public OutageType Type { get; set; }
	public DateTime ReportedAt { get; set; }
	public int? UserId { get; set; }
}