using Bandobast.API.Common;
using Bandobast.API.Data;
using Bandobast.API.Features.Auth;
using Bandobast.API.Features.Complaints.Dtos;
using Microsoft.EntityFrameworkCore;

using Bandobast.API.Features.Gamification;
using Microsoft.EntityFrameworkCore;

namespace Bandobast.API.Features.Complaints;

public class ComplaintService
{
    private readonly AppDbContext _db;
    private readonly GamificationService _gamificationService;

    public ComplaintService(AppDbContext db, GamificationService gamificationService)
    {
        _db = db;
        _gamificationService = gamificationService;
    }

    public async Task<(ComplaintResponseDto? Result, User? User, string? Error)> CreateAsync(CreateComplaintDto dto, int userId)
    {
        // Simple validation
        if (string.IsNullOrWhiteSpace(dto.Category) || string.IsNullOrWhiteSpace(dto.Type))
        {
            return (null, null, "Category and Type are required.");
        }

        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return (null, null, "User not found.");

        var complaint = new Complaint
        {
            UserId = userId,
            Category = dto.Category,
            Type = dto.Type,
            Title = dto.Title,
            Description = dto.Description,
            LocalityId = dto.LocalityId,
            SpecificLocation = dto.SpecificLocation,
            EvidenceUrl = dto.EvidenceUrl,
            Status = "SUBMITTED",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Complaints.Add(complaint);
        await _db.SaveChangesAsync(); // To get the ID

        // Generate public reference ID: BND-YYYYMMDD-XXXXXX
        complaint.PublicReferenceId = $"BND-{DateTime.UtcNow:yyyyMMdd}-{complaint.Id:D6}";
        
        await _db.SaveChangesAsync();

        // Award 10 points for creating a complaint
        await _gamificationService.AddPointsAsync(userId, 10);

        var localityName = complaint.LocalityId.HasValue 
            ? (await _db.Localities.FindAsync(complaint.LocalityId.Value))?.Name 
            : null;

        return (MapToDto(complaint, localityName), user, null);
    }


    public async Task<PaginatedResult<ComplaintResponseDto>> GetMyComplaintsAsync(int userId, int page = 1, int pageSize = 10)
    {
        var query = _db.Complaints
            .Include(c => c.Locality)
            .Include(c => c.User)
            .Where(c => c.UserId == userId)
            .AsQueryable();

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => MapToDto(c, c.Locality != null ? c.Locality.Name : null, c.User))
            .ToListAsync();

        return new PaginatedResult<ComplaintResponseDto>(items, totalCount, page, pageSize);
    }
    
    public async Task<ComplaintResponseDto?> GetMyComplaintByIdAsync(int id, int userId)
    {
        var complaint = await _db.Complaints
            .Include(c => c.Locality)
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
            
        if (complaint == null) return null;
        
        return MapToDto(complaint, complaint.Locality?.Name, complaint.User);
    }

    public async Task<(bool Success, string? Error)> VouchAsync(int complaintId, int voucherUserId)
    {
        var complaint = await _db.Complaints.FindAsync(complaintId);
        if (complaint == null) return (false, "Complaint not found.");

        if (complaint.UserId == voucherUserId)
            return (false, "You cannot vouch for your own complaint.");

        var alreadyVouched = await _db.ComplaintVouches
            .AnyAsync(v => v.ComplaintId == complaintId && v.UserId == voucherUserId);
        
        if (alreadyVouched)
            return (false, "You have already vouched for this complaint.");

        var vouch = new ComplaintVouch
        {
            ComplaintId = complaintId,
            UserId = voucherUserId
        };
        _db.ComplaintVouches.Add(vouch);
        
        complaint.VouchCount++;
        await _db.SaveChangesAsync();

        // Award points
        await _gamificationService.AddPointsAsync(voucherUserId, 2); // Voucher gets +2
        await _gamificationService.AddPointsAsync(complaint.UserId, 5); // Author gets +5

        return (true, null);
    }

    public async Task<PaginatedResult<ComplaintResponseDto>> GetPublicComplaintsAsync(int? localityId, int page = 1, int pageSize = 10)
    {
        var query = _db.Complaints
            .Include(c => c.Locality)
            .Include(c => c.User)
            .AsQueryable();

        if (localityId.HasValue)
        {
            query = query.Where(c => c.LocalityId == localityId.Value);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => MapToDto(c, c.Locality != null ? c.Locality.Name : null, c.User))
            .ToListAsync();

        return new PaginatedResult<ComplaintResponseDto>(items, totalCount, page, pageSize);
    }

    internal static ComplaintResponseDto MapToDto(Complaint c, string? localityName, User? user = null)
    {
        return new ComplaintResponseDto
        {
            Id = c.Id,
            PublicReferenceId = c.PublicReferenceId,
            Category = c.Category,
            Type = c.Type,
            Title = c.Title,
            Description = c.Description,
            LocalityId = c.LocalityId,
            LocalityName = localityName,
            SpecificLocation = c.SpecificLocation,
            Status = c.Status,
            EvidenceUrl = c.EvidenceUrl,
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt,
            ResolvedAt = c.ResolvedAt,
            VouchCount = c.VouchCount,
            SubmitterName = user?.DisplayName ?? "Anonymous",
            SubmitterIsVerified = user?.IsVerified ?? false
        };
    }
}
