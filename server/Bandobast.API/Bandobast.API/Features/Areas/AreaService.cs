using Bandobast.API.Data;
using Bandobast.API.Features.Areas.Dtos;
using Microsoft.EntityFrameworkCore;

namespace Bandobast.API.Features.Areas;

public class AreaService
{
	private readonly AppDbContext _db;

	public AreaService(AppDbContext db)
	{
		_db = db;
	}

	public async Task<Bandobast.API.Common.PaginatedResult<AreaResponseDto>> GetAllAsync(string? search, int page = 1, int pageSize = 10)
	{
		var cutoff = DateTime.UtcNow.AddHours(-24);
		
        var query = _db.Localities.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(l => l.Name.ToLower().Contains(s) || l.PinCode.Contains(s));
        }

        var totalCount = await query.CountAsync();

		var items = await query
			.Select(l => new AreaResponseDto
			{
				Id = l.Id,
				Name = l.Name,
				PinCode = l.PinCode,
				Latitude = l.Latitude,
				Longitude = l.Longitude,
				RecentOutageCount = _db.OutageReports.Count(o => o.LocalityId == l.Id && o.ReportedAt >= cutoff)
			})
			.OrderBy(a => a.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
			.ToListAsync();

        return new Bandobast.API.Common.PaginatedResult<AreaResponseDto>(items, totalCount, page, pageSize);
	}

	public async Task<AreaResponseDto?> GetByIdAsync(int id)
	{
		var l = await _db.Localities.FindAsync(id);
		if (l == null) return null;

		return new AreaResponseDto
		{
			Id = l.Id,
			Name = l.Name,
			PinCode = l.PinCode,
			Latitude = l.Latitude,
			Longitude = l.Longitude
		};
	}

	public async Task<(AreaResponseDto? Result, string? Error)> CreateAsync(CreateAreaDto dto)
	{
		var normalizedName = dto.Name.Trim();

		var exists = await _db.Localities.AnyAsync(l =>
			l.PinCode == dto.PinCode && l.Name.ToLower() == normalizedName.ToLower());

		if (exists)
			return (null, "A locality with this name and PIN code already exists.");

		var locality = new Locality
		{
			Name = normalizedName,
			PinCode = dto.PinCode,
			Latitude = dto.Latitude,
			Longitude = dto.Longitude
		};

		_db.Localities.Add(locality);

		try
		{
			await _db.SaveChangesAsync();
		}
		catch (DbUpdateException)
		{
			// Catches the unique index violation as a safety net for race conditions
			return (null, "A locality with this name and PIN code already exists.");
		}

		return (new AreaResponseDto
		{
			Id = locality.Id,
			Name = locality.Name,
			PinCode = locality.PinCode,
			Latitude = locality.Latitude,
			Longitude = locality.Longitude
		}, null);
	}
}