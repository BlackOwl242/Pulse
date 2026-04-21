using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Pulse.API.Data;
using Pulse.API.Hubs;
using Pulse.API.Middleware;
using Pulse.API.Services;
using Pulse.API.Services.Interfaces;
using Serilog;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Allow up to 1 GB file uploads
builder.WebHost.ConfigureKestrel(o => o.Limits.MaxRequestBodySize = 1024L * 1024 * 1024);

// ===== Serilog =====
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// ===== Database =====
#pragma warning disable CS0618
Npgsql.NpgsqlConnection.GlobalTypeMapper.EnableDynamicJson();
#pragma warning restore CS0618

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ===== Authentication (Dual: Custom JWT + KeyCloak for Google) =====
var jwtSettings = builder.Configuration.GetSection("Jwt");
var keycloakConfig = builder.Configuration.GetSection("Keycloak");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // Primary: Custom JWT for email/password login
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Secret"]!)),
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };

    // Support SignalR token from query string
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
})
.AddJwtBearer("Keycloak", options =>
{
    // Secondary: KeyCloak JWT for Google OAuth login
    options.Authority = keycloakConfig["Authority"]; // http://localhost:8080/realms/pulse
    options.Audience = keycloakConfig["Audience"];    // pulse-client
    options.RequireHttpsMetadata = false; // dev only

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = keycloakConfig["Authority"],
        ValidateAudience = true,
        ValidAudience = keycloakConfig["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// ===== Services =====
builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient(); // For Keycloak code exchange
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IEmailService, EmailService>();

// ===== PicoClaw MCP Server =====
builder.Services.Configure<Pulse.API.Models.Common.PicoClawSettings>(
    builder.Configuration.GetSection("PicoClaw"));
builder.Services.AddHttpClient<IPicoClawService, PicoClawService>(client =>
{
    var picoClawConfig = builder.Configuration.GetSection("PicoClaw");
    client.BaseAddress = new Uri(picoClawConfig["BaseUrl"]!);
    client.Timeout = TimeSpan.FromSeconds(60);
});
builder.Services.AddScoped<IAIActionExecutor, AIActionExecutor>();
builder.Services.AddScoped<IActivityLogService, ActivityLogService>();

// ===== SignalR =====
builder.Services.AddSignalR();

// ===== Controllers =====
builder.Services.AddControllers();

// ===== CORS =====
builder.Services.AddCors(options =>
{
    options.AddPolicy("PulsePolicy", policy =>
    {
        policy.WithOrigins(
                builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? ["http://localhost:3000"])
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ===== Swagger =====
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHostedService<Pulse.API.Services.MessageCleanupService>();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Pulse API",
        Version = "v1",
        Description = "Enterprise Project Management & Collaboration Platform"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ===== Middleware Pipeline =====
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Pulse API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseSerilogRequestLogging();
app.UseHttpsRedirection();
app.UseCors("PulsePolicy");
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");
app.MapHub<ChatHub>("/hubs/chat");
app.MapHub<WhiteboardHub>("/hubs/whiteboard");

// ===== Auto-migrate + seed in development =====
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
    await DbSeeder.SeedSampleDataAsync(db);
}

app.Run();
