using Bandobast.API.Common;
using Bandobast.API.Data;
using Bandobast.API.Features.Admin.Dtos;
using Bandobast.API.Features.Complaints;
using Microsoft.EntityFrameworkCore;

namespace Bandobast.API.Features.Admin;

public class AdminService
{
    private readonly AppDbContext _db;

    public AdminService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PaginatedResult<AdminComplaintResponseDto>> GetAllComplaintsAsync(int page = 1, int pageSize = 20)
    {
        var query = _db.Complaints
            .Include(c => c.Locality)
            .Include(c => c.User)
            .AsQueryable();

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => MapToAdminDto(c))
            .ToListAsync();

        return new PaginatedResult<AdminComplaintResponseDto>(items, totalCount, page, pageSize);
    }

    public async Task<AdminComplaintResponseDto?> GetComplaintByIdAsync(int id)
    {
        var complaint = await _db.Complaints
            .Include(c => c.Locality)
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == id);
            
        if (complaint == null) return null;
        
        return MapToAdminDto(complaint);
    }

    public async Task<bool> UpdateStatusAsync(int id, string newStatus)
    {
        var complaint = await _db.Complaints.FindAsync(id);
        if (complaint == null) return false;

        complaint.Status = newStatus;
        complaint.UpdatedAt = DateTime.UtcNow;
        
        if (newStatus.ToUpper() == "RESOLVED")
        {
            complaint.ResolvedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AddAdminNoteAsync(int id, string note)
    {
        var complaint = await _db.Complaints.FindAsync(id);
        if (complaint == null) return false;

        var existingNotes = complaint.AdminNotes ?? "";
        var newNoteEntry = $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC] {note}";
        
        complaint.AdminNotes = string.IsNullOrWhiteSpace(existingNotes) 
            ? newNoteEntry 
            : existingNotes + "\n" + newNoteEntry;
            
        complaint.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return true;
    }

    private static AdminComplaintResponseDto MapToAdminDto(Complaint c)
    {
        return new AdminComplaintResponseDto
        {
            Id = c.Id,
            PublicReferenceId = c.PublicReferenceId,
            Category = c.Category,
            Type = c.Type,
            Title = c.Title,
            Description = c.Description,
            LocalityId = c.LocalityId,
            LocalityName = c.Locality?.Name,
            SpecificLocation = c.SpecificLocation,
            Status = c.Status,
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt,
            ResolvedAt = c.ResolvedAt,
            AdminNotes = c.AdminNotes,
            UserEmail = c.User?.Email ?? "Unknown",
            UserDisplayName = c.User?.DisplayName ?? "Unknown"
        };
    }
}
