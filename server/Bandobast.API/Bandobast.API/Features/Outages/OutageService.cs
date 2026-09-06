using Bandobast.API.Data;
using Bandobast.API.Features.Outages.Dtos;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

namespace Bandobast.API.Features.Outages;

public class OutageService
{
	private readonly AppDbContext _db;

	public OutageService(AppDbContext db)
	{
		_db = db;
	}

    // Haversine formula to calculate distance in Kilometers
    private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        var R = 6371d; // Earth radius in km
        var dLat = (lat2 - lat1) * Math.PI / 180d;
        var dLon = (lon2 - lon1) * Math.PI / 180d;
        var a = Math.Sin(dLat / 2d) * Math.Sin(dLat / 2d) +
                Math.Cos(lat1 * Math.PI / 180d) * Math.Cos(lat2 * Math.PI / 180d) *
                Math.Sin(dLon / 2d) * Math.Sin(dLon / 2d);
        var c = 2d * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1d - a));
        return R * c;
    }

	public async Task<(OutageResponseDto? Result, string? Error)> CreateAsync(CreateOutageDto dto, int userId)
	{
		var locality = await _db.Localities.FindAsync(dto.LocalityId);
		if (locality == null)
			return (null, $"Locality with id {dto.LocalityId} does not exist.");

        // Geofencing Check (7km range limit)
        if (dto.Latitude.HasValue && dto.Longitude.HasValue)
        {
            var distance = CalculateDistance(dto.Latitude.Value, dto.Longitude.Value, locality.Latitude, locality.Longitude);
            if (distance > 7.0)
            {
                return (null, $"You are too far away ({Math.Round(distance, 1)}km) to report an outage in {locality.Name}. Must be within 7km.");
            }
        }
        else
        {
            return (null, "GPS Location is required to verify the authenticity of this outage report.");
        }

        // Check if user is Shadowbanned
        var user = await _db.Users.FindAsync(userId);
        if (user?.BannedUntil != null && user.BannedUntil > DateTime.UtcNow)
        {
            return (null, $"Your account is temporarily restricted from reporting outages until {user.BannedUntil.Value:MMM dd, yyyy}.");
        }

        // Extended 4-Hour Cooldown
		var cooldownWindow = DateTime.UtcNow.AddHours(-4);
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
            .Include(o => o.User)
			.Where(o => o.LocalityId == localityId && o.ReportedAt >= activeWindow && o.ResolvedAt == null)
			.ToListAsync();

        // Calculate Consensus Scores (Needs >= 3 to be active)
        // Verified users and high CivicPoints hold 2x weight
        int powerScore = recentReports.Where(o => o.Type == OutageType.Power)
            .GroupBy(o => o.UserId)
            .Sum(g => (g.First().User!.IsVerified || g.First().User!.CivicPoints > 500) ? 2 : 1);
            
        int waterScore = recentReports.Where(o => o.Type == OutageType.Water)
            .GroupBy(o => o.UserId)
            .Sum(g => (g.First().User!.IsVerified || g.First().User!.CivicPoints > 500) ? 2 : 1);

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
			HasActivePowerOutage = powerScore >= 3,
			HasActiveWaterOutage = waterScore >= 3,
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