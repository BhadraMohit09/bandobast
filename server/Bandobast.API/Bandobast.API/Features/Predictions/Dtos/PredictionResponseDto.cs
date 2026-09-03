namespace Bandobast.API.Features.Predictions.Dtos;

public class PredictionResponseDto
{
	public int LocalityId { get; set; }
	public string LocalityName { get; set; } = string.Empty;
	public List<PatternDto> Patterns { get; set; } = new();
}

public class PatternDto
{
	public string DayOfWeek { get; set; } = string.Empty;
	public int HourBucketStart { get; set; }
	public int HourBucketEnd { get; set; }
	public string OutageType { get; set; } = string.Empty;
	public int OccurrenceCount { get; set; }
}