using Bandobast.API.Features.Auth;

namespace Bandobast.API.Features.Complaints;

public class ComplaintVouch
{
    public int Id { get; set; }
    
    public int ComplaintId { get; set; }
    public Complaint? Complaint { get; set; }
    
    public int UserId { get; set; }
    public User? User { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
