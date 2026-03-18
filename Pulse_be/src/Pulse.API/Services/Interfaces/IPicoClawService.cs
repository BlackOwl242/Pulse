namespace Pulse.API.Services.Interfaces;

public interface IPicoClawService
{
    Task<PicoClawResponse> SendRequestAsync(string action, string message, Dictionary<string, object>? data = null);
    Task<bool> CheckHealthAsync();
}

public class PicoClawResponse
{
    public bool Success { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? Error { get; set; }
    public List<Services.AIAction> Actions { get; set; } = new();
}
