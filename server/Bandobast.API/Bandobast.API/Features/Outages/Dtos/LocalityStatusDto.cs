namespace Bandobast.API.Features.Outages.Dtos;

public class LocalityStatusDto
{
    public bool HasActivePowerOutage { get; set; }
    public bool HasActiveWaterOutage { get; set; }
    public DateTime? LastPowerReport { get; set; }
    public DateTime? LastWaterReport { get; set; }
}
