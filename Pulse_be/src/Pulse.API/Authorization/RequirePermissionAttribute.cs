using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Data;
using System.Security.Claims;

namespace Pulse.API.Authorization;

/// <summary>
/// Attribute that checks if the current user has a specific permission
/// in the workspace identified by the {slug} route parameter.
/// Usage: [RequirePermission("project.create")]
/// </summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
public class RequirePermissionAttribute : Attribute, IAsyncAuthorizationFilter
{
    private readonly string _module;
    private readonly string _action;

    /// <param name="permission">Format: "module.action" e.g. "project.create"</param>
    public RequirePermissionAttribute(string permission)
    {
        var parts = permission.Split('.', 2);
        _module = parts[0];
        _action = parts.Length > 1 ? parts[1] : "*";
    }

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

        // Get workspace slug from route
        var slug = context.RouteData.Values["slug"]?.ToString();
        if (string.IsNullOrEmpty(slug))
        {
            context.Result = new BadRequestObjectResult(new { message = "Workspace slug is required" });
            return;
        }

        var db = context.HttpContext.RequestServices.GetRequiredService<ApplicationDbContext>();

        // Check if user has the required permission in the workspace
        var hasPermission = await db.UserWorkspaceRoles
            .Where(uwr => uwr.UserId == userId && uwr.Workspace.Slug == slug)
            .SelectMany(uwr => uwr.Role.RolePermissions)
            .AnyAsync(rp => rp.Permission.Module == _module && rp.Permission.Action == _action);

        if (!hasPermission)
        {
            context.Result = new ObjectResult(new { message = $"Missing permission: {_module}.{_action}" })
            {
                StatusCode = 403
            };
        }
    }
}
