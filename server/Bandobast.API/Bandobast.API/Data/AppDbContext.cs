using Microsoft.EntityFrameworkCore;
using Bandobast.API.Features.Areas;
using Bandobast.API.Features.Outages;
using Bandobast.API.Features.Auth;
using Bandobast.API.Features.Complaints;
using Bandobast.API.Features.Notifications;

namespace Bandobast.API.Data;

public class AppDbContext : DbContext
{
	public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

	public DbSet<Locality> Localities => Set<Locality>();
	public DbSet<OutageReport> OutageReports => Set<OutageReport>();
	public DbSet<User> Users => Set<User>();
	public DbSet<Complaint> Complaints => Set<Complaint>();
	public DbSet<Notification> Notifications => Set<Notification>();
	public DbSet<UserBadge> UserBadges => Set<UserBadge>();
	public DbSet<ComplaintVouch> ComplaintVouches => Set<ComplaintVouch>();

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		modelBuilder.Entity<Locality>()
			.HasIndex(l => new { l.PinCode, l.Name })
			.IsUnique();

		modelBuilder.Entity<User>()
			.HasIndex(u => u.Email)
			.IsUnique();

		modelBuilder.Entity<Complaint>()
			.HasIndex(c => c.PublicReferenceId)
			.IsUnique();

		modelBuilder.Entity<Notification>()
			.HasIndex(n => n.ComplaintId);

		modelBuilder.Entity<Notification>()
			.HasIndex(n => n.Status);

		modelBuilder.Entity<ComplaintVouch>()
			.HasIndex(v => new { v.ComplaintId, v.UserId })
			.IsUnique();
	}
}