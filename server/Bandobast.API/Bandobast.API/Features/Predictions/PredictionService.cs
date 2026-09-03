using Bandobast.API.Data;
using Bandobast.API.Features.Predictions.Dtos;
using Microsoft.EntityFrameworkCore;

namespace Bandobast.API.Features.Predictions;

public class PredictionService
{
	private readonly AppDbContext _db;

	public PredictionService(AppDbContext db)
	{
		_db = db;
	}

	public async Task<PredictionResponseDto?> GetPredictionsAsync(int localityId)
	{
		var locality = await _db.Localities.FindAsync(localityId);
		if (locality == null) return null;

		var reports = await _db.OutageReports
			.Where(o => o.LocalityId == localityId)
			.ToListAsync();

		var patterns = reports
			.GroupBy(o => new
			{
				DayOfWeek = o.ReportedAt.DayOfWeek,
				HourBucket = o.ReportedAt.Hour / 2 // 2-hour buckets: 0-2, 2-4, etc.
			})
			.Select(g => new PatternDto
			{
				DayOfWeek = g.Key.DayOfWeek.ToString(),
				HourBucketStart = g.Key.HourBucket * 2,
				HourBucketEnd = (g.Key.HourBucket * 2) + 2,
				OutageType = g.GroupBy(o => o.Type).OrderByDescending(t => t.Count()).First().Key.ToString(),
				OccurrenceCount = g.Count()
			})
			.Where(p => p.OccurrenceCount >= 2) // only surface patterns with at least 2 occurrences
			.OrderByDescending(p => p.OccurrenceCount)
			.ToList();

		return new PredictionResponseDto
		{
			LocalityId = locality.Id,
			LocalityName = locality.Name,
			Patterns = patterns
		};
	}
}