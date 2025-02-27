using Microsoft.AspNetCore.Cors.Infrastructure;

namespace GigaScramSoft.Extensions
{
    public static class CorsExtensions
    {
        public static IServiceCollection AddCustomCors(this IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", builder =>
                {
                    builder
                        .WithOrigins(
                            "http://localhost:5173",  // Development HTTP
                            "https://localhost:5173", // Development HTTPS
                            "http://localhost:4173",  // Production HTTP
                            "https://localhost:4173"  // Production HTTPS
                        )
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials();
                });
            });

            return services;
        }
    }
} 