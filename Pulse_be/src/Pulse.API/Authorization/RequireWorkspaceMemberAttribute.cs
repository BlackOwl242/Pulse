using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Data;
using System.Security.Claims;

namespace Pulse.API.Authorization;

/// <summary>
/// Attribute that checks if the current user is a member of the workspace
/// identified by the {slug} or {workspaceSlug} route parameter.
/// Usage: [RequireWorkspaceMember] on controller or action
/// </summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false)]
public class RequireWorkspaceMemberAttribute : Attribute, IAsyncAuthorizationFilter
{
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var user = context.HttpContext.User;
        if (!user.Identity?.IsAuthenticated ?? true)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var userIdClaim = user.FindFirstValue(ClaimTypes.NameIdentifier)
                         ?? user.FindFirstValue("sub");
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        // Get workspace slug from route — try both {slug} and {workspaceSlug}
        var slug = context.RouteData.Values["slug"]?.ToString()
                   ?? context.RouteData.Values["workspaceSlug"]?.ToString();

        if (string.IsNullOrEmpty(slug))
        {
            // No workspace slug in route — skip check (controller doesn't need workspace context)
            return;
        }

        var db = context.HttpContext.RequestServices.GetRequiredService<ApplicationDbContext>();

        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == slug);
        if (workspace == null)
        {
            context.Result = new NotFoundObjectResult(new { message = "Workspace not found" });
            return;
        }

        var isMember = await db.UserWorkspaceRoles
            .AnyAsync(uwr => uwr.UserId == userId && uwr.WorkspaceId == workspace.Id);

        if (!isMember)
        {
            context.Result = new ObjectResult(new { message = "You are not a member of this workspace" })
            {
                StatusCode = 403
            };
        }
    }
}
