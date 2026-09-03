using Bandobast.API.Data;
using Microsoft.EntityFrameworkCore;

namespace Bandobast.API.Features.Notifications;

/// <summary>
/// Background worker that retries FAILED notifications every 5 minutes,
/// up to a maximum of 3 total attempts per notification.
/// </summary>
public class NotificationRetryWorker : BackgroundService
{
    private static readonly TimeSpan RetryInterval = TimeSpan.FromMinutes(5);
    private const int MaxAttempts = 3;

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<NotificationRetryWorker> _logger;

    public NotificationRetryWorker(IServiceScopeFactory scopeFactory, ILogger<NotificationRetryWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("NotificationRetryWorker started.");

        // Initial delay so API fully starts before first retry run
        await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessFailedNotificationsAsync(stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _logger.LogError(ex, "NotificationRetryWorker encountered an error during processing.");
            }

            await Task.Delay(RetryInterval, stoppingToken);
        }

        _logger.LogInformation("NotificationRetryWorker stopped.");
    }

    private async Task ProcessFailedNotificationsAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var notificationService = scope.ServiceProvider.GetRequiredService<NotificationService>();

        // Find notifications that are FAILED and have not exceeded max attempts
        var failedNotifications = await db.Notifications
            .Where(n => n.Status == NotificationStatus.Failed && n.Attempts < MaxAttempts)
            .Select(n => n.Id)
            .ToListAsync(cancellationToken);

        if (failedNotifications.Count == 0)
        {
            _logger.LogDebug("NotificationRetryWorker: No failed notifications to retry.");
            return;
        }

        _logger.LogInformation("NotificationRetryWorker: Retrying {Count} failed notification(s).", failedNotifications.Count);

        foreach (var notifId in failedNotifications)
        {
            if (cancellationToken.IsCancellationRequested) break;

            try
            {
                await notificationService.RetryNotificationAsync(notifId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "NotificationRetryWorker: Error retrying notification {Id}", notifId);
            }
        }
    }
}
