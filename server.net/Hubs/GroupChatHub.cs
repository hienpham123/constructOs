using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;

namespace ConstructOs.Server.Hubs;

[Authorize]
public class GroupChatHub : Hub
{

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst("userId")?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            Context.Abort();
            return;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst("userId")?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user-{userId}");
        }
        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinGroup(string groupId)
    {
        var userId = Context.User?.FindFirst("userId")?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, $"group-{groupId}");
    }

    public async Task LeaveGroup(string groupId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"group-{groupId}");
    }
}

