using Bandobast.API.Features.Complaints.Dtos;
using Bandobast.API.Features.Notifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace Bandobast.API.Features.Complaints;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ComplaintsController : ControllerBase
{
    private readonly ComplaintService _complaintService;
    private readonly NotificationService _notificationService;
    private readonly Cloudinary _cloudinary;
    private readonly ILogger<ComplaintsController> _logger;

    public ComplaintsController(
        ComplaintService complaintService,
        NotificationService notificationService,
        IConfiguration config,
        ILogger<ComplaintsController> logger)
    {
        _complaintService = complaintService;
        _notificationService = notificationService;
        _logger = logger;

        var cloudName = config["Cloudinary:CloudName"] ?? "";
        var apiKey = config["Cloudinary:ApiKey"] ?? "";
        var apiSecret = config["Cloudinary:ApiSecret"] ?? "";
        var account = new Account(cloudName, apiKey, apiSecret);
        _cloudinary = new Cloudinary(account);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateComplaintDto dto)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

        var (result, user, error) = await _complaintService.CreateAsync(dto, userId);
        if (error != null) return BadRequest(new { message = error });
        if (result == null || user == null) return StatusCode(500, new { message = "Unexpected error." });

        // Capture everything needed for the background task before returning
        var complaint = new Complaint
        {
            Id = result.Id,
            PublicReferenceId = result.PublicReferenceId,
            UserId = user.Id,
            Category = result.Category,
            Type = result.Type,
            Title = result.Title,
            Description = result.Description,
            LocalityId = result.LocalityId,
            SpecificLocation = result.SpecificLocation,
            Status = result.Status,
            CreatedAt = result.CreatedAt,
            UpdatedAt = result.UpdatedAt
        };

        var localityName = result.LocalityName;
        var capturedUser = user;
        var capturedLogger = _logger;
        var capturedNotifService = _notificationService;
        var capturedReportId = result.PublicReferenceId;

        // Fire-and-forget: send notifications AFTER returning the response.
        // Report submission NEVER fails because of notification failure.
        _ = Task.Run(async () =>
        {
            try
            {
                await capturedNotifService.SendReportConfirmationAsync(complaint, capturedUser, localityName);
            }
            catch (Exception ex)
            {
                capturedLogger.LogError(ex, "Unhandled error in fire-and-forget notification for {ReportId}", capturedReportId);
            }
        });

        return Ok(result);
    }

    [HttpPost("upload-evidence")]
    public async Task<IActionResult> UploadEvidence(IFormFile file)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

        if (file == null || file.Length == 0) return BadRequest("No file provided");

        using var stream = file.OpenReadStream();
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            // Less strict transformation than profile photo
            Transformation = new Transformation().Width(1200).Crop("limit")
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams);
        if (uploadResult.Error != null) return StatusCode(500, "Failed to upload image");

        return Ok(new { url = uploadResult.SecureUrl.ToString() });
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyComplaints([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

        var result = await _complaintService.GetMyComplaintsAsync(userId, page, pageSize);
        return Ok(result);
    }
    
    [HttpGet("me/{id}")]
    public async Task<IActionResult> GetMyComplaint(int id)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

        var result = await _complaintService.GetMyComplaintByIdAsync(id, userId);
        if (result == null) return NotFound();
        
        return Ok(result);
    }

    [HttpPost("{id}/vouch")]
    public async Task<IActionResult> Vouch(int id)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

        var (success, error) = await _complaintService.VouchAsync(id, userId);
        if (!success) return BadRequest(new { message = error });

        return Ok(new { message = "Successfully vouched for complaint." });
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublicComplaints([FromQuery] int? localityId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _complaintService.GetPublicComplaintsAsync(localityId, page, pageSize);
        return Ok(result);
    }
}
