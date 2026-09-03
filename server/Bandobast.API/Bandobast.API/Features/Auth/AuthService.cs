using Bandobast.API.Data;
using Bandobast.API.Features.Auth.Dtos;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

using Bandobast.API.Features.Notifications;

namespace Bandobast.API.Features.Auth;

public class AuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly IEmailService _emailService;
    private readonly EmailTemplateService _emailTemplateService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(AppDbContext db, IConfiguration config, IEmailService emailService, EmailTemplateService emailTemplateService, ILogger<AuthService> logger)
    {
        _db = db;
        _config = config;
        _emailService = emailService;
        _emailTemplateService = emailTemplateService;
        _logger = logger;
    }

    private string GenerateOtp()
    {
        var random = new Random();
        var letters = new string(Enumerable.Repeat("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 2).Select(s => s[random.Next(s.Length)]).ToArray());
        var digits = new string(Enumerable.Repeat("0123456789", 4).Select(s => s[random.Next(s.Length)]).ToArray());
        return $"{letters}{digits}";
    }

    public async Task<(AuthResponseDto? Result, string? Error)> RegisterAsync(RegisterDto dto)
    {
        var normalizedEmail = dto.Email.Trim().ToLower();

        var exists = await _db.Users.AnyAsync(u => u.Email == normalizedEmail);
        if (exists)
            return (null, "An account with this email already exists.");

        var otp = GenerateOtp();
        var user = new User
        {
            Email = normalizedEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            DisplayName = dto.DisplayName.Trim(),
            IsEmailVerified = false,
            EmailVerificationOtp = otp,
            EmailVerificationOtpExpiry = DateTime.UtcNow.AddMinutes(5)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        // Send OTP Email
        _ = Task.Run(async () =>
        {
            try
            {
                var html = _emailTemplateService.BuildOtpHtml(user.DisplayName, otp);
                var plainText = _emailTemplateService.BuildOtpPlainText(user.DisplayName, otp);
                var emailMsg = new EmailMessage(user.Email, user.DisplayName, "Verify your Bandobast account", html, plainText);
                await _emailService.SendAsync(emailMsg);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send OTP email to {Email}", user.Email);
            }
        });

        var token = GenerateJwt(user);

        return (new AuthResponseDto
        {
            Token = token,
            UserId = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            ProfilePhotoUrl = user.ProfilePhotoUrl,
            Role = user.Role,
            IsEmailVerified = user.IsEmailVerified
        }, null);
    }

    public async Task<(AuthResponseDto? Result, string? Error)> LoginAsync(LoginDto dto)
    {
        var normalizedEmail = dto.Email.Trim().ToLower();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return (null, "Invalid email or password.");

        var token = GenerateJwt(user);

        return (new AuthResponseDto
        {
            Token = token,
            UserId = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            ProfilePhotoUrl = user.ProfilePhotoUrl,
            Role = user.Role,
            IsEmailVerified = user.IsEmailVerified
        }, null);
    }

    public async Task<(bool Success, string? Error)> VerifyEmailAsync(string email, string otp)
    {
        var normalizedEmail = email.Trim().ToLower();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        if (user == null)
            return (false, "User not found.");
            
        if (user.IsEmailVerified)
            return (true, null);

        if (user.EmailVerificationOtp != otp.Trim().ToUpper())
            return (false, "Invalid verification code.");

        if (user.EmailVerificationOtpExpiry < DateTime.UtcNow)
            return (false, "Verification code has expired. Please request a new one.");

        user.IsEmailVerified = true;
        user.EmailVerificationOtp = null;
        user.EmailVerificationOtpExpiry = null;
        
        await _db.SaveChangesAsync();

        // Send Welcome Email
        _ = Task.Run(async () =>
        {
            try
            {
                var html = _emailTemplateService.BuildWelcomeHtml(user.DisplayName);
                var plainText = _emailTemplateService.BuildWelcomePlainText(user.DisplayName);
                var emailMsg = new EmailMessage(user.Email, user.DisplayName, "Welcome to Bandobast!", html, plainText);
                await _emailService.SendAsync(emailMsg);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send welcome email to {Email}", user.Email);
            }
        });

        return (true, null);
    }

    public async Task<(bool Success, string? Error)> ResendOtpAsync(string email)
    {
        var normalizedEmail = email.Trim().ToLower();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        if (user == null)
            return (false, "User not found.");

        if (user.IsEmailVerified)
            return (false, "Email is already verified.");

        var otp = GenerateOtp();
        user.EmailVerificationOtp = otp;
        user.EmailVerificationOtpExpiry = DateTime.UtcNow.AddMinutes(5);
        
        await _db.SaveChangesAsync();

        // Send OTP Email
        _ = Task.Run(async () =>
        {
            try
            {
                var html = _emailTemplateService.BuildOtpHtml(user.DisplayName, otp);
                var plainText = _emailTemplateService.BuildOtpPlainText(user.DisplayName, otp);
                var emailMsg = new EmailMessage(user.Email, user.DisplayName, "Verify your Bandobast account", html, plainText);
                await _emailService.SendAsync(emailMsg);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send resent OTP email to {Email}", user.Email);
            }
        });

        return (true, null);
    }

    public async Task<(bool Success, string? Error)> ForgotPasswordAsync(string email)
    {
        var normalizedEmail = email.Trim().ToLower();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        if (user == null)
        {
            // Do not reveal that the user does not exist.
            return (true, null);
        }

        var token = Guid.NewGuid().ToString("N");
        user.PasswordResetToken = token;
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(15);
        await _db.SaveChangesAsync();

        // Send Email
        _ = Task.Run(async () =>
        {
            try
            {
                var clientUrl = _config["ClientUrl"] ?? "http://localhost:3000";
                var resetLink = $"{clientUrl}/reset-password?token={token}&email={Uri.EscapeDataString(user.Email)}";
                var html = _emailTemplateService.BuildPasswordResetHtml(user.DisplayName, resetLink);
                var plainText = _emailTemplateService.BuildPasswordResetPlainText(user.DisplayName, resetLink);
                var emailMsg = new EmailMessage(user.Email, user.DisplayName, "Password Reset Request", html, plainText);
                await _emailService.SendAsync(emailMsg);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send password reset email to {Email}", user.Email);
            }
        });

        return (true, null);
    }

    public async Task<(bool Success, string? Error)> ResetPasswordAsync(ResetPasswordDto dto)
    {
        var normalizedEmail = dto.Email.Trim().ToLower();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        if (user == null || user.PasswordResetToken != dto.Token || user.PasswordResetTokenExpiry < DateTime.UtcNow)
        {
            return (false, "Invalid or expired password reset token.");
        }

        if (BCrypt.Net.BCrypt.Verify(dto.NewPassword, user.PasswordHash))
        {
            return (false, "New password cannot be the same as the old password.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiry = null;
        
        await _db.SaveChangesAsync();

        return (true, null);
    }

    private string GenerateJwt(User user)
    {
        var jwtSettings = _config.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Secret"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim("displayName", user.DisplayName),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpiryMinutes"]!)),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
