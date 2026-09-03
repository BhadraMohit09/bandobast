using System.ComponentModel.DataAnnotations;

namespace Bandobast.API.Features.Areas.Dtos;

public class CreateAreaDto
{
	[Required, MaxLength(150)]
	public string Name { get; set; } = string.Empty;

	[Required, RegularExpression(@"^\d{6}$", ErrorMessage = "PIN code must be 6 digits")]
	public string PinCode { get; set; } = string.Empty;

	[Range(-90, 90)]
	public double Latitude { get; set; }

	[Range(-180, 180)]
	public double Longitude { get; set; }
}