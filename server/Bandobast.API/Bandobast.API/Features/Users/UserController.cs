using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Bandobast.API.Features.Users;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly UserService _userService;

    public UserController(UserService userService)
    {
        _userService = userService;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdString, out var userId)) return Unauthorized();

        var profile = await _userService.GetUserProfileAsync(userId);
        if (profile == null) return NotFound();

        return Ok(profile);
    }

    [HttpGet("profile/outages")]
    public async Task<IActionResult> GetOutages([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdString, out var userId)) return Unauthorized();

        var result = await _userService.GetUserOutagesAsync(userId, search, page, pageSize);
        return Ok(result);
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdString, out var userId)) return Unauthorized();

        var success = await _userService.UpdateUserProfileAsync(userId, dto);
        if (!success) return NotFound();

        return Ok();
    }

    [HttpPut("profile-photo")]
    public async Task<IActionResult> UpdateProfilePhoto(IFormFile file)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdString, out var userId)) return Unauthorized();

        if (file == null || file.Length == 0) return BadRequest("No file provided");

        var url = await _userService.UploadProfilePhotoAsync(userId, file);
        if (url == null) return StatusCode(500, "Failed to upload photo");

        return Ok(new { url });
    }

    [HttpPost("purchase-verification")]
    public async Task<IActionResult> PurchaseVerification()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdString, out var userId)) return Unauthorized();

        var success = await _userService.PurchaseVerificationAsync(userId);
        if (!success) return BadRequest(new { message = "Failed to apply verification badge." });

        return Ok(new { message = "Verification successfully purchased!" });
    }
}
