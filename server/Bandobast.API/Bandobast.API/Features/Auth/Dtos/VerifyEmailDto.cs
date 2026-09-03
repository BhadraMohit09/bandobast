namespace Bandobast.API.Features.Auth.Dtos;

public class VerifyEmailDto
{
    public string Email { get; set; } = string.Empty;
    public string Otp { get; set; } = string.Empty;
}

public class ResendOtpDto
{
    public string Email { get; set; } = string.Empty;
}
