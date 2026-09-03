using Bandobast.API.Data;
using Bandobast.API.Features.Auth;
using Microsoft.EntityFrameworkCore;

namespace Bandobast.API.Features.Gamification;

public class GamificationService
{
    private readonly AppDbContext _db;
    private readonly ILogger<GamificationService> _logger;

    public GamificationService(AppDbContext db, ILogger<GamificationService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task AddPointsAsync(int userId, int points)
    {
        var user = await _db.Users.Include(u => u.Badges).FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return;

        user.CivicPoints += points;
        
        await CheckAndAwardBadgesAsync(user);
        
        await _db.SaveChangesAsync();
    }

    private async Task CheckAndAwardBadgesAsync(User user)
    {
        var existingBadges = user.Badges.Select(b => b.BadgeName).ToHashSet();
        var newlyAwarded = false;

        // Logic for awarding badges based on points
        if (user.CivicPoints >= 50 && !existingBadges.Contains("Civic Starter"))
        {
            user.Badges.Add(new UserBadge { UserId = user.Id, BadgeName = "Civic Starter" });
            newlyAwarded = true;
            _logger.LogInformation("User {UserId} earned badge 'Civic Starter'", user.Id);
        }
        
        if (user.CivicPoints >= 200 && !existingBadges.Contains("Neighborhood Watch"))
        {
            user.Badges.Add(new UserBadge { UserId = user.Id, BadgeName = "Neighborhood Watch" });
            newlyAwarded = true;
            _logger.LogInformation("User {UserId} earned badge 'Neighborhood Watch'", user.Id);
        }
        
        if (user.CivicPoints >= 500 && !existingBadges.Contains("City Guardian"))
        {
            user.Badges.Add(new UserBadge { UserId = user.Id, BadgeName = "City Guardian" });
            newlyAwarded = true;
            _logger.LogInformation("User {UserId} earned badge 'City Guardian'", user.Id);
        }
    }
}
