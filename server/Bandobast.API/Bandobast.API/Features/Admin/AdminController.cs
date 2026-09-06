using Bandobast.API.Features.Admin.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Bandobast.API.Features.Admin;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN")]
public class AdminController : ControllerBase
{
    private readonly AdminService _adminService;

    public AdminController(AdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("complaints")]
    public async Task<IActionResult> GetAllComplaints([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _adminService.GetAllComplaintsAsync(page, pageSize);
        return Ok(result);
    }

    [HttpGet("complaints/{id}")]
    public async Task<IActionResult> GetComplaint(int id)
    {
        var result = await _adminService.GetComplaintByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPatch("complaints/{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateComplaintStatusDto dto)
    {
        var success = await _adminService.UpdateStatusAsync(id, dto.Status);
        if (!success) return NotFound();
        return Ok(new { message = "Status updated successfully." });
    }

    [HttpPost("complaints/{id}/notes")]
    public async Task<IActionResult> AddNote(int id, [FromBody] AddAdminNoteDto dto)
    {
        var success = await _adminService.AddAdminNoteAsync(id, dto.Note);
        if (!success) return NotFound();
        return Ok(new { message = "Note added successfully." });
    }

    [HttpPost("outages/{id}/flag-fake")]
    public async Task<IActionResult> MarkOutageFake(int id)
    {
        var success = await _adminService.MarkOutageFakeAsync(id);
        if (!success) return NotFound();
        return Ok(new { message = "Outage marked as fake. Reporter penalized." });
    }
}
