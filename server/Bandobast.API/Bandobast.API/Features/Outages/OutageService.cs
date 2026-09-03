using Bandobast.API.Data;
using Bandobast.API.Features.Outages.Dtos;
using Microsoft.EntityFrameworkCore;

namespace Bandobast.API.Features.Outages;

public class OutageService
{
	private readonly AppDbContext _db;

	public OutageService(AppDbContext db)
	{
		_db = db;
	}

	public async Task<(OutageResponseDto? Result, string? Error)> CreateAsync(CreateOutageDto dto, int userId)
	{
		var locality = await _db.Localities.FindAsync(dto.LocalityId);
		if (locality == null)
			return (null, $"Locality with id {dto.LocalityId} does not exist.");

		var cooldownWindow = DateTime.UtcNow.AddMinutes(-30);
		var recentDuplicate = await _db.OutageReports.AnyAsync(o =>
			o.LocalityId == dto.LocalityId &&
			o.Type == dto.Type &&
			o.UserId == userId &&
			o.ReportedAt >= cooldownWindow);

		if (recentDuplicate)
			return (null, "You've already reported this outage recently. Thanks for confirming it's still happening!");

		var report = new OutageReport
		{
			LocalityId = dto.LocalityId,
			Type = dto.Type,
			UserId = userId,
			ReportedAt = DateTime.UtcNow
		};

		_db.OutageReports.Add(report);
		await _db.SaveChangesAsync();

		return (new OutageResponseDto
		{
			Id = report.Id,
			LocalityId = report.LocalityId,
			LocalityName = locality.Name,
			Type = report.Type,
			ReportedAt = report.ReportedAt
		}, null);
	}

	public async Task<bool> ResolveAsync(int reportId, int userId)
	{
		var report = await _db.OutageReports.FirstOrDefaultAsync(o => o.Id == reportId && o.UserId == userId);
		if (report == null) return false;

		if (report.ResolvedAt == null)
		{
			report.ResolvedAt = DateTime.UtcNow;
			await _db.SaveChangesAsync();
		}
		return true;
	}

	public async Task<LocalityStatusDto> GetCurrentStatusAsync(int localityId)
	{
		var activeWindow = DateTime.UtcNow.AddHours(-3);

		var recentReports = await _db.OutageReports
			.Where(o => o.LocalityId == localityId && o.ReportedAt >= activeWindow && o.ResolvedAt == null)
			.ToListAsync();

		var lastPower = await _db.OutageReports
			.Where(o => o.LocalityId == localityId && o.Type == OutageType.Power)
			.OrderByDescending(o => o.ReportedAt)
			.Select(o => (DateTime?)o.ReportedAt)
			.FirstOrDefaultAsync();

		var lastWater = await _db.OutageReports
			.Where(o => o.LocalityId == localityId && o.Type == OutageType.Water)
			.OrderByDescending(o => o.ReportedAt)
			.Select(o => (DateTime?)o.ReportedAt)
			.FirstOrDefaultAsync();

		return new LocalityStatusDto
		{
			HasActivePowerOutage = recentReports.Any(o => o.Type == OutageType.Power),
			HasActiveWaterOutage = recentReports.Any(o => o.Type == OutageType.Water),
			LastPowerReport = lastPower,
			LastWaterReport = lastWater
		};
	}

	public async Task<Bandobast.API.Common.PaginatedResult<OutageResponseDto>> GetByLocalityAsync(int localityId, string? search, int page = 1, int pageSize = 10)
	{
		var query = _db.OutageReports
			.Where(o => o.LocalityId == localityId && o.ResolvedAt == null)
            .Include(o => o.Locality)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            if (s == "power") query = query.Where(o => o.Type == OutageType.Power);
            else if (s == "water") query = query.Where(o => o.Type == OutageType.Water);
        }

        var totalCount = await query.CountAsync();

        var items = await query
			.OrderByDescending(o => o.ReportedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
			.Select(o => new OutageResponseDto
			{
				Id = o.Id,
				LocalityId = o.LocalityId,
				LocalityName = o.Locality!.Name,
				Type = o.Type,
				ReportedAt = o.ReportedAt,
				UserId = o.UserId
			})
			.ToListAsync();

        return new Bandobast.API.Common.PaginatedResult<OutageResponseDto>(items, totalCount, page, pageSize);
	}
}