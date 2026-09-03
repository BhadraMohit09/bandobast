using Bandobast.API.Features.Areas;
using Bandobast.API.Features.Auth;

namespace Bandobast.API.Features.Outages;

public enum OutageType { Power, Water }

public class OutageReport
{
	public int Id { get; set; }
	public int LocalityId { get; set; }
	public Locality? Locality { get; set; }
	public OutageType Type { get; set; }
	public DateTime ReportedAt { get; set; } = DateTime.UtcNow;
	public string ReporterToken { get; set; } = string.Empty; // kept for backward compatibility with pre-auth data
	public int? UserId { get; set; }
	public User? User { get; set; }
	public DateTime? ResolvedAt { get; set; }
}