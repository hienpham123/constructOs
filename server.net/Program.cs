using ConstructOs.Server.Config;
using ConstructOs.Server.Middleware;
using ConstructOs.Server.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        var frontendUrl = builder.Configuration["FRONTEND_URL"] ?? builder.Configuration["CORS_ORIGIN"] ?? "*";
        if (frontendUrl == "*")
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        }
        else
        {
            policy.WithOrigins(frontendUrl)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        }
    });
});

// Configure JWT Authentication
var jwtSecret = builder.Configuration["JWT_SECRET"] ?? "constructos-secret-key-change-in-production";
var key = Encoding.UTF8.GetBytes(jwtSecret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
    
    // Configure SignalR JWT authentication
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            
            // If the request is for a SignalR hub
            if (!string.IsNullOrEmpty(accessToken) && 
                (path.StartsWithSegments("/hubs/groupchat") || 
                 path.StartsWithSegments("/hubs/directmessage")))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

// Register database service
builder.Services.AddScoped<IDatabaseService, DatabaseService>();

// Register notification service
builder.Services.AddScoped<ConstructOs.Server.Utils.NotificationService>();

// Register SignalR
builder.Services.AddSignalR();

// Configure static files
var uploadsPath = Path.Combine(builder.Environment.ContentRootPath, "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

// Serve static files
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

app.MapControllers();

// Map SignalR hubs
app.MapHub<GroupChatHub>("/hubs/groupchat");
app.MapHub<DirectMessageHub>("/hubs/directmessage");

// Health check endpoint
app.MapGet("/api/health", () => Results.Ok(new { status = "ok", message = "Server is running" }));

app.Run();

