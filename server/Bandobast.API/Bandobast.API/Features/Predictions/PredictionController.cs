using Microsoft.AspNetCore.Mvc;

namespace Bandobast.API.Features.Predictions;

[ApiController]
[Route("api/[controller]")]
public class PredictionController : ControllerBase
{
	private readonly PredictionService _service;

	public PredictionController(PredictionService service)
	{
		_service = service;
	}

	[HttpGet]
	public async Task<IActionResult> Get([FromQuery] int localityId)
	{
		var result = await _service.GetPredictionsAsync(localityId);
		return result == null ? NotFound() : Ok(result);
	}
}