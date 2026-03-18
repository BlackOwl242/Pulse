namespace Pulse.API.Models.Common;

public class PicoClawSettings
{
    public string BaseUrl { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public PicoClawEndpoints Endpoints { get; set; } = new();
}

public class PicoClawEndpoints
{
    public string Request { get; set; } = "/erp/request";
    public string Health { get; set; } = "/erp/health";
}
