using System.Text;

namespace Bandobast.API.Features.Notifications;

public class EmailTemplateService
{
    /// <summary>
    /// Builds the HTML body for the report-submitted confirmation email.
    /// </summary>
    public string BuildReportSubmittedHtml(ReportEmailData data)
    {
        var trackingLink = string.IsNullOrWhiteSpace(data.TrackingUrl) ? "#" : data.TrackingUrl;
        var locationDisplay = string.IsNullOrWhiteSpace(data.Location) ? "Not specified" : data.Location;
        var descriptionDisplay = string.IsNullOrWhiteSpace(data.Description) ? "No description provided." : data.Description;

        // CSS uses braces so we build it as a separate string to avoid raw-string-literal conflicts
        var css = GetCss();

        var sb = new StringBuilder();
        sb.Append("<!DOCTYPE html>");
        sb.Append("<html lang=\"en\">");
        sb.Append("<head>");
        sb.Append("<meta charset=\"UTF-8\" />");
        sb.Append("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"/>");
        sb.Append("<title>Report Submitted — Bandobast</title>");
        sb.Append($"<style>{css}</style>");
        sb.Append("</head>");
        sb.Append("<body>");
        sb.Append("<div class=\"wrapper\">");

        // Header
        sb.Append("<div class=\"header\">");
        sb.Append("<p class=\"header-title\">bandobast</p>");
        sb.Append("<p class=\"header-subtitle\">Report Submission Confirmation</p>");
        sb.Append("</div>");

        // Body
        sb.Append("<div class=\"body\">");
        sb.Append($"<p class=\"greeting\">Hello {HtmlEncode(data.UserName)},</p>");
        sb.Append("<p class=\"intro\">Your report has been successfully submitted through Bandobast. We have recorded your complaint and it is now under review.</p>");

        sb.Append("<p class=\"section-label\">Report Details</p>");
        sb.Append("<div class=\"report-card\">");
        sb.Append($"<p class=\"report-id\">{HtmlEncode(data.ReportId)}</p>");

        AppendField(sb, "Category", data.Category);
        AppendField(sb, "Type", data.Type);
        AppendField(sb, "Submitted On", data.SubmittedOn.ToString("dd MMM yyyy, hh:mm tt") + " UTC");
        AppendField(sb, "Location", locationDisplay);

        sb.Append("<div class=\"field\">");
        sb.Append("<p class=\"field-label\">Status</p>");
        sb.Append($"<p class=\"field-value\"><span class=\"status-badge\">{HtmlEncode(data.Status)}</span></p>");
        sb.Append("</div>");

        sb.Append("<div class=\"field\">");
        sb.Append("<p class=\"field-label\">Description</p>");
        sb.Append($"<div class=\"description-box\">{HtmlEncode(descriptionDisplay)}</div>");
        sb.Append("</div>");

        sb.Append("</div>"); // report-card

        sb.Append("<p class=\"intro\">Your report has been recorded and can be tracked from your Bandobast account. Please keep your Report ID for future reference.</p>");

        sb.Append("<div class=\"cta\">");
        sb.Append($"<a href=\"{trackingLink}\" class=\"cta-btn\" style=\"color: #ffffff; text-decoration: none;\">Track Your Report</a>");
        sb.Append("</div>");

        sb.Append("</div>"); // body

        // Footer
        sb.Append("<div class=\"footer\">");
        sb.Append("<p class=\"footer-brand\">bandobast</p>");
        sb.Append($"<p class=\"footer-text\">This is an automated confirmation. Please do not reply to this email.<br/>© {DateTime.UtcNow.Year} Bandobast. Community-powered civic intelligence.</p>");
        sb.Append("</div>");

        sb.Append("</div>"); // wrapper
        sb.Append("</body>");
        sb.Append("</html>");

        return sb.ToString();
    }

    /// <summary>
    /// Builds a plain-text fallback for email clients that don't render HTML.
    /// </summary>
    public string BuildReportSubmittedPlainText(ReportEmailData data)
    {
        var location = string.IsNullOrWhiteSpace(data.Location) ? "Not specified" : data.Location;
        var description = string.IsNullOrWhiteSpace(data.Description) ? "No description provided." : data.Description;

        return $"""
Bandobast — Report Submission Confirmation

Hello {data.UserName},

Your report has been successfully submitted through Bandobast.

REPORT DETAILS
--------------
Report ID   : {data.ReportId}
Category    : {data.Category}
Type        : {data.Type}
Submitted On: {data.SubmittedOn:dd MMM yyyy, hh:mm tt} UTC
Location    : {location}
Status      : {data.Status}

Description:
{description}

Track your report at: {data.TrackingUrl}

Thank you for using Bandobast.
© {DateTime.UtcNow.Year} Bandobast
""";
    }

    /// <summary>
    /// Builds a concise SMS message for report confirmation.
    /// </summary>
    public string BuildReportSubmittedSms(string reportId, string category)
    {
        return $"Bandobast: Your {category} report {reportId} has been successfully submitted. Status: Submitted. Track it from your Bandobast account.";
    }

    public string BuildOtpHtml(string userName, string otpCode)
    {
        var css = GetCss();
        var sb = new StringBuilder();
        sb.Append("<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\" /><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"/><title>Verify Your Email — Bandobast</title>");
        sb.Append($"<style>{css}</style></head><body><div class=\"wrapper\">");
        
        sb.Append("<div class=\"header\"><p class=\"header-title\">bandobast</p><p class=\"header-subtitle\">Email Verification</p></div>");
        sb.Append("<div class=\"body\">");
        sb.Append($"<p class=\"greeting\">Hello {HtmlEncode(userName)},</p>");
        sb.Append("<p class=\"intro\">Welcome to Bandobast! Please use the following One-Time Password (OTP) to verify your email address. This code is valid for 5 minutes.</p>");
        
        sb.Append("<div class=\"report-card\" style=\"text-align: center; padding: 32px;\">");
        sb.Append($"<p class=\"report-id\" style=\"font-size: 32px; letter-spacing: 4px; border: none; margin: 0; padding: 0;\">{HtmlEncode(otpCode)}</p>");
        sb.Append("</div>");
        
        sb.Append("<p class=\"intro\">If you didn't request this, you can safely ignore this email.</p>");
        sb.Append("</div>");

        sb.Append("<div class=\"footer\"><p class=\"footer-brand\">bandobast</p>");
        sb.Append($"<p class=\"footer-text\">This is an automated confirmation. Please do not reply to this email.<br/>© {DateTime.UtcNow.Year} Bandobast. Community-powered civic intelligence.</p></div>");
        sb.Append("</div></body></html>");

        return sb.ToString();
    }

    public string BuildOtpPlainText(string userName, string otpCode)
    {
        return $"""
Bandobast — Email Verification

Hello {userName},

Welcome to Bandobast! Please use the following One-Time Password (OTP) to verify your email address. This code is valid for 5 minutes.

OTP CODE: {otpCode}

If you didn't request this, you can safely ignore this email.

© {DateTime.UtcNow.Year} Bandobast
""";
    }

    public string BuildWelcomeHtml(string userName)
    {
        var css = GetCss();
        var sb = new StringBuilder();
        sb.Append("<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\" /><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"/><title>Welcome to Bandobast</title>");
        sb.Append($"<style>{css}</style></head><body><div class=\"wrapper\">");
        
        sb.Append("<div class=\"header\"><p class=\"header-title\">bandobast</p><p class=\"header-subtitle\">Welcome</p></div>");
        sb.Append("<div class=\"body\">");
        sb.Append($"<p class=\"greeting\">Welcome aboard, {HtmlEncode(userName)}!</p>");
        sb.Append("<p class=\"intro\">Your email has been successfully verified. You are now ready to start reporting issues and contributing to community-powered civic intelligence.</p>");
        sb.Append("<p class=\"intro\">Thank you for joining Bandobast.</p>");
        sb.Append("</div>");

        sb.Append("<div class=\"footer\"><p class=\"footer-brand\">bandobast</p>");
        sb.Append($"<p class=\"footer-text\">This is an automated confirmation. Please do not reply to this email.<br/>© {DateTime.UtcNow.Year} Bandobast. Community-powered civic intelligence.</p></div>");
        sb.Append("</div></body></html>");

        return sb.ToString();
    }

    public string BuildWelcomePlainText(string userName)
    {
        return $"""
Welcome to Bandobast!

Welcome aboard, {userName}!

Your email has been successfully verified. You are now ready to start reporting issues and contributing to community-powered civic intelligence.

Thank you for joining Bandobast.

© {DateTime.UtcNow.Year} Bandobast
""";
    }

    public string BuildPasswordResetHtml(string userName, string resetLink)
    {
        var css = GetCss();
        var sb = new StringBuilder();
        sb.Append("<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\" /><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"/><title>Reset Your Password — Bandobast</title>");
        sb.Append($"<style>{css}</style></head><body><div class=\"wrapper\">");
        
        sb.Append("<div class=\"header\"><p class=\"header-title\">bandobast</p><p class=\"header-subtitle\">Password Reset</p></div>");
        sb.Append("<div class=\"body\">");
        sb.Append($"<p class=\"greeting\">Hello {HtmlEncode(userName)},</p>");
        sb.Append("<p class=\"intro\">We received a request to reset your password for your Bandobast account. Click the button below to choose a new password. This link is valid for 15 minutes.</p>");
        
        sb.Append("<div class=\"cta\">");
        sb.Append($"<a href=\"{resetLink}\" class=\"cta-btn\">Reset Password</a>");
        sb.Append("</div>");
        
        sb.Append("<p class=\"intro\">If you didn't request a password reset, you can safely ignore this email.</p>");
        sb.Append("</div>");

        sb.Append("<div class=\"footer\"><p class=\"footer-brand\">bandobast</p>");
        sb.Append($"<p class=\"footer-text\">This is an automated message. Please do not reply to this email.<br/>© {DateTime.UtcNow.Year} Bandobast. Community-powered civic intelligence.</p></div>");
        sb.Append("</div></body></html>");

        return sb.ToString();
    }

    public string BuildPasswordResetPlainText(string userName, string resetLink)
    {
        return $"""
Bandobast — Password Reset

Hello {userName},

We received a request to reset your password for your Bandobast account. Click the link below to choose a new password. This link is valid for 15 minutes.

Reset Link: {resetLink}

If you didn't request a password reset, you can safely ignore this email.

© {DateTime.UtcNow.Year} Bandobast
""";
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private static void AppendField(StringBuilder sb, string label, string value)
    {
        sb.Append("<div class=\"field\">");
        sb.Append($"<p class=\"field-label\">{HtmlEncode(label)}</p>");
        sb.Append($"<p class=\"field-value\">{HtmlEncode(value)}</p>");
        sb.Append("</div>");
    }

    private static string HtmlEncode(string? value) =>
        System.Net.WebUtility.HtmlEncode(value ?? string.Empty);

    private static string GetCss() => @"
body { margin: 0; padding: 0; background-color: #F5F4EF; font-family: 'Helvetica Neue', Arial, sans-serif; color: #10201B; }
.wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #D8D8D1; border-radius: 12px; overflow: hidden; }
.header { background-color: #10201B; padding: 32px 40px; }
.header-title { color: #F5F4EF; font-size: 22px; font-weight: 600; letter-spacing: -0.5px; margin: 0; }
.header-subtitle { color: #7A8C89; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 6px 0 0 0; }
.body { padding: 40px; }
.greeting { font-size: 18px; font-weight: 600; color: #10201B; margin: 0 0 8px 0; }
.intro { font-size: 15px; color: #5E6B68; margin: 0 0 32px 0; line-height: 1.6; }
.section-label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #7A817D; font-weight: 600; margin: 0 0 16px 0; }
.report-card { background: #F5F4EF; border: 1px solid #D8D8D1; border-radius: 8px; padding: 24px; margin-bottom: 32px; }
.report-id { font-family: 'Courier New', monospace; font-size: 22px; font-weight: 700; color: #10201B; letter-spacing: 1px; margin: 0 0 20px 0; border-bottom: 1px solid #D8D8D1; padding-bottom: 16px; }
.field { margin-bottom: 14px; }
.field-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #7A817D; margin: 0 0 3px 0; }
.field-value { font-size: 14px; color: #10201B; margin: 0; }
.status-badge { display: inline-block; background: #E8F5F0; color: #10201B; border: 1px solid #B8D8CE; border-radius: 20px; padding: 3px 12px; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
.description-box { background: #ffffff; border: 1px solid #D8D8D1; border-radius: 6px; padding: 16px; margin-top: 4px; font-size: 14px; color: #5E6B68; line-height: 1.6; }
.cta { text-align: center; margin: 32px 0; }
.cta-btn { display: inline-block; background-color: #10201B; color: #ffffff !important; text-decoration: none; padding: 14px 36px; border-radius: 100px; font-size: 14px; font-weight: 600; letter-spacing: 0.5px; }
.footer { padding: 24px 40px; border-top: 1px solid #D8D8D1; background: #F5F4EF; }
.footer-text { font-size: 12px; color: #7A817D; margin: 0; line-height: 1.6; }
.footer-brand { font-size: 14px; font-weight: 600; color: #10201B; margin: 0 0 4px 0; }
";
}

public record ReportEmailData(
    string UserName,
    string ReportId,
    string Category,
    string Type,
    DateTime SubmittedOn,
    string? Location,
    string? Description,
    string Status,
    string TrackingUrl
);
