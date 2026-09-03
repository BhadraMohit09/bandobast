using Bandobast.API.Features.Auth.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Bandobast.API.Features.Auth;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _service;

    public AuthController(AuthService service)
    {
        _service = service;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var (result, error) = await _service.RegisterAsync(dto);
        if (error != null) return Conflict(new { message = error });
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var (result, error) = await _service.LoginAsync(dto);
        if (error != null) return Unauthorized(new { message = error });
        return Ok(result);
    }

    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail(VerifyEmailDto dto)
    {
        var (success, error) = await _service.VerifyEmailAsync(dto.Email, dto.Otp);
        if (!success) return BadRequest(new { message = error });
        return Ok(new { message = "Email verified successfully." });
    }

    [HttpPost("resend-otp")]
    public async Task<IActionResult> ResendOtp(ResendOtpDto dto)
    {
        var (success, error) = await _service.ResendOtpAsync(dto.Email);
        if (!success) return BadRequest(new { message = error });
        return Ok(new { message = "OTP sent successfully." });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
    {
        var (success, error) = await _service.ForgotPasswordAsync(dto.Email);
        if (!success) return BadRequest(new { message = error });
        return Ok(new { message = "If the email is registered, a password reset link has been sent." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
    {
        var (success, error) = await _service.ResetPasswordAsync(dto);
        if (!success) return BadRequest(new { message = error });
        return Ok(new { message = "Password successfully reset." });
    }
}
