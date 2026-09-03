using Bandobast.API.Data;
using Bandobast.API.Features.Outages;
using Microsoft.EntityFrameworkCore;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace Bandobast.API.Features.Users;

public class UserBadgeDto
{
    public string BadgeName { get; set; } = string.Empty;
    public DateTime EarnedAt { get; set; }
}

public class UserProfileDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? ProfilePhotoUrl { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Bio { get; set; }
    public int? PreferredLocalityId { get; set; }
    public DateTime CreatedAt { get; set; }
    public int CivicPoints { get; set; }
    public bool IsVerified { get; set; }
    public List<UserBadgeDto> Badges { get; set; } = new();
}

public class UpdateProfileDto
{
    public string DisplayName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Bio { get; set; }
    public int? PreferredLocalityId { get; set; }
}

public class OutageDto
{
    public int Id { get; set; }
    public int LocalityId { get; set; }
    public string LocalityName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public DateTime ReportedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
}

public class UserService
{
    private readonly AppDbContext _context;
    private readonly Cloudinary _cloudinary;

    public UserService(AppDbContext context, IConfiguration config)
    {
        _context = context;

        var cloudName = config["Cloudinary:CloudName"] ?? "";
        var apiKey = config["Cloudinary:ApiKey"] ?? "";
        var apiSecret = config["Cloudinary:ApiSecret"] ?? "";

        var account = new Account(cloudName, apiKey, apiSecret);
        _cloudinary = new Cloudinary(account);
    }

    public async Task<UserProfileDto?> GetUserProfileAsync(int userId)
    {
        var user = await _context.Users
            .Include(u => u.Badges)
            .FirstOrDefaultAsync(u => u.Id == userId);
            
        if (user == null) return null;

        return new UserProfileDto
        {
            Id = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            ProfilePhotoUrl = user.ProfilePhotoUrl,
            PhoneNumber = user.PhoneNumber,
            Bio = user.Bio,
            PreferredLocalityId = user.PreferredLocalityId,
            CreatedAt = user.CreatedAt,
            CivicPoints = user.CivicPoints,
            IsVerified = user.IsVerified,
            Badges = user.Badges.Select(b => new UserBadgeDto 
            {
                BadgeName = b.BadgeName,
                EarnedAt = b.EarnedAt
            }).ToList()
        };
    }

    public async Task<bool> PurchaseVerificationAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        user.IsVerified = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<Bandobast.API.Common.PaginatedResult<OutageDto>> GetUserOutagesAsync(int userId, string? search, int page = 1, int pageSize = 10)
    {
        var query = _context.OutageReports
            .Include(o => o.Locality)
            .Where(o => o.UserId == userId)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(o => 
                (o.Locality != null && o.Locality.Name.ToLower().Contains(s)) ||
                (s == "power" && o.Type == OutageType.Power) ||
                (s == "water" && o.Type == OutageType.Water)
            );
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(o => o.ReportedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new OutageDto
            {
                Id = o.Id,
                LocalityId = o.LocalityId,
                LocalityName = o.Locality != null ? o.Locality.Name : "Unknown",
                Type = o.Type.ToString(),
                ReportedAt = o.ReportedAt,
                ResolvedAt = o.ResolvedAt
            })
            .ToListAsync();

        return new Bandobast.API.Common.PaginatedResult<OutageDto>(items, totalCount, page, pageSize);
    }

    public async Task<bool> UpdateUserProfileAsync(int userId, UpdateProfileDto dto)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        user.DisplayName = dto.DisplayName;
        user.PhoneNumber = dto.PhoneNumber;
        user.Bio = dto.Bio;
        user.PreferredLocalityId = dto.PreferredLocalityId;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<string?> UploadProfilePhotoAsync(int userId, IFormFile file)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return null;

        using var stream = file.OpenReadStream();
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Transformation = new Transformation().Width(500).Height(500).Crop("fill").Gravity("face")
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams);
        if (uploadResult.Error != null) return null;

        user.ProfilePhotoUrl = uploadResult.SecureUrl.ToString();
        await _context.SaveChangesAsync();

        return user.ProfilePhotoUrl;
    }
}
