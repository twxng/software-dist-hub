using GigaScramSoft.Auth;
using GigaScramSoft.Services;
using GigaScramSoft.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using GigaScramSoft;

var builder = WebApplication.CreateBuilder(args);

// Налаштування HTTPS
builder.WebHost.UseUrls("http://localhost:5050");

// Налаштування CORS перед усіма іншими сервісами
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", builder =>
    {
        builder
            .WithOrigins(
                "http://localhost:5173",  // Development
                "http://localhost:4173"   // Production
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Add services to the container.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("GigaScramSoft")));
builder.Services.AddTransient<IUserService, UserService>();

//Додаємо конфігурацію AuthSettings
builder.Services.Configure<AuthSettings>(builder.Configuration.GetSection("AuthSettings"));

//Робота з JWT
builder.Services.AddAuth(builder.Configuration);
builder.Services.AddAuthentication();
builder.Services.AddAuthorization();
builder.Services.AddControllers();

// Swagger configuration
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { 
        Title = "GigaScramSoft API", 
        Version = "v1",
        Description = "API для GigaScramSoft"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Будь ласка, введіть токен у форматі: Bearer {token}",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Порядок middleware важливий!
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// CORS має бути перед UseRouting
app.UseCors("AllowFrontend");

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();