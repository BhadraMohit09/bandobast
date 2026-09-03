using Bandobast.API.Features.Outages.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Bandobast.API.Features.Outages;

[ApiController]
[Route("api/[controller]")]
public class OutageController : ControllerBase
{
	private readonly OutageService _service;

	public OutageController(OutageService service)
	{
		_service = service;
	}

	[HttpPost]
	[Authorize]
	[EnableRateLimiting("OutagePost")]
	public async Task<IActionResult> Create(CreateOutageDto dto)
	{
		var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
		if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
			return Unauthorized();

		var (result, error) = await _service.CreateAsync(dto, userId);
		if (error != null)
		{
			if (error.Contains("already reported"))
				return Conflict(new { message = error });
			return BadRequest(new { message = error });
		}
		return Ok(result);
	}

	[HttpPatch("{id}/resolve")]
	[Authorize]
	public async Task<IActionResult> Resolve(int id)
	{
		var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
		if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
			return Unauthorized();

		var success = await _service.ResolveAsync(id, userId);
		if (!success) return NotFound(new { message = "Report not found or not owned by you." });
		return Ok(new { message = "Resolved successfully." });
	}

	[HttpGet("status")]
	public async Task<IActionResult> GetStatus([FromQuery] int localityId)
	{
		var result = await _service.GetCurrentStatusAsync(localityId);
		return Ok(result);
	}

	[HttpGet]
	public async Task<IActionResult> GetByLocality([FromQuery] int localityId, [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
	{
		var result = await _service.GetByLocalityAsync(localityId, search, page, pageSize);
		return Ok(result);
	}
}