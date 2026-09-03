using Bandobast.API.Features.Areas.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Bandobast.API.Features.Areas;

[ApiController]
[Route("api/[controller]")]
public class AreaController : ControllerBase
{
	private readonly AreaService _service;

	public AreaController(AreaService service)
	{
		_service = service;
	}

	[HttpGet]
	public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
	{
		var result = await _service.GetAllAsync(search, page, pageSize);
		return Ok(result);
	}

	[HttpGet("{id}")]
	public async Task<IActionResult> GetById(int id)
	{
		var result = await _service.GetByIdAsync(id);
		return result == null ? NotFound() : Ok(result);
	}

	[HttpPost]
	public async Task<IActionResult> Create(CreateAreaDto dto)
	{
		var (result, error) = await _service.CreateAsync(dto);
		if (error != null) return Conflict(new { message = error });
		return CreatedAtAction(nameof(GetById), new { id = result!.Id }, result);
	}
}