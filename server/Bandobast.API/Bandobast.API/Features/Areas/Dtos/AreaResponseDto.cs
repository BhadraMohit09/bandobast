namespace Bandobast.API.Features.Areas.Dtos;

public class AreaResponseDto
{
	public int Id { get; set; }
	public string Name { get; set; } = string.Empty;
	public string PinCode { get; set; } = string.Empty;
	public double Latitude { get; set; }
	public double Longitude { get; set; }
	public int RecentOutageCount { get; set; }
}