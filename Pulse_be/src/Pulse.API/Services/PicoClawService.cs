using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using Pulse.API.Models.Common;
using Pulse.API.Services.Interfaces;

namespace Pulse.API.Services;

public class PicoClawService : IPicoClawService
{
    private readonly HttpClient _http;
    private readonly PicoClawSettings _settings;
    private readonly ILogger<PicoClawService> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true
    };

    public PicoClawService(HttpClient http, IOptions<PicoClawSettings> settings, ILogger<PicoClawService> logger)
    {
        _http = http;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<PicoClawResponse> SendRequestAsync(string action, string message, Dictionary<string, object>? data = null)
    {
        try
        {
            var payload = new { action, message, data = data ?? new Dictionary<string, object>() };
            var json = JsonSerializer.Serialize(payload, JsonOptions);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var request = new HttpRequestMessage(HttpMethod.Post, _settings.Endpoints.Request)
            {
                Content = content
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _settings.ApiKey);

            _logger.LogInformation("Sending PicoClaw request: action={Action}, message length={Len}", action, message.Length);

            var response = await _http.SendAsync(request);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("PicoClaw returned {StatusCode}: {Body}", response.StatusCode, responseBody);
                return new PicoClawResponse
                {
                    Success = false,
                    Content = "Xin lỗi, AI assistant hiện không khả dụng. Vui lòng thử lại sau.",
                    Error = $"PicoClaw returned {response.StatusCode}"
                };
            }

            // Try to parse response - PicoClaw may return various formats
            try
            {
                using var doc = JsonDocument.Parse(responseBody);
                var root = doc.RootElement;

                // Try common response fields
                var contentText = root.TryGetProperty("reply", out var reply) ? reply.GetString()
                    : root.TryGetProperty("response", out var resp) ? resp.GetString()
                    : root.TryGetProperty("content", out var cont) ? cont.GetString()
                    : root.TryGetProperty("message", out var msg) ? msg.GetString()
                    : root.TryGetProperty("result", out var res) ? res.GetString()
                    : responseBody;

                // Parse actions if present
                var actions = new List<AIAction>();
                if (root.TryGetProperty("actions", out var actionsEl) && actionsEl.ValueKind == JsonValueKind.Array)
                {
                    foreach (var actionEl in actionsEl.EnumerateArray())
                    {
                        var aiAction = new AIAction();
                        if (actionEl.TryGetProperty("type", out var typeEl))
                            aiAction.Type = typeEl.GetString() ?? "";
                        if (actionEl.TryGetProperty("data", out var dataEl) && dataEl.ValueKind == JsonValueKind.Object)
                        {
                            foreach (var prop in dataEl.EnumerateObject())
                                aiAction.Data[prop.Name] = prop.Value.Clone();
                        }
                        actions.Add(aiAction);
                    }
                    _logger.LogInformation("PicoClaw returned {Count} actions", actions.Count);
                }

                return new PicoClawResponse
                {
                    Success = true,
                    Content = contentText ?? responseBody,
                    Actions = actions
                };
            }
            catch (JsonException)
            {
                // Response is plain text
                return new PicoClawResponse
                {
                    Success = true,
                    Content = responseBody
                };
            }
        }
        catch (TaskCanceledException ex)
        {
            _logger.LogError(ex, "PicoClaw request timed out");
            return new PicoClawResponse
            {
                Success = false,
                Content = "AI assistant đang phản hồi chậm. Vui lòng thử lại sau.",
                Error = "Request timed out"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "PicoClaw request failed");
            return new PicoClawResponse
            {
                Success = false,
                Content = "Không thể kết nối đến AI assistant. Vui lòng thử lại sau.",
                Error = ex.Message
            };
        }
    }

    public async Task<bool> CheckHealthAsync()
    {
        try
        {
            var request = new HttpRequestMessage(HttpMethod.Get, _settings.Endpoints.Health);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _settings.ApiKey);
            var response = await _http.SendAsync(request);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "PicoClaw health check failed");
            return false;
        }
    }
}
