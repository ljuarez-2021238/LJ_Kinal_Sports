using Microsoft.AspNetCore.DataProtection;

namespace AuthService.Api.Extensions;

public static class SecurityExtensions
{
    private static readonly string[] DefaultAllowedOrigins = ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"];
    private static readonly string[] DefaultAdminOrigins = ["http://localhost:5173"];
    private static readonly string[] AllowedHttpMethods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"];
    private static readonly string[] AdminHttpMethods = ["GET", "POST", "PUT", "DELETE"];
    private static readonly string[] AdminAllowedHeaders = ["Content-Type", "Authorization"];
    public static IServiceCollection AddSecurityPolicies(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
    {
        // Configurar CORS
        services.AddCors(options =>
        {
            options.AddPolicy("DefaultCorsPolicy", builder =>
            {
                var allowedOrigins = configuration.GetSection("Security:AllowedOrigins").Get<string[]>()
                    ?? DefaultAllowedOrigins;

                builder.SetIsOriginAllowed(origin => true)
                       .AllowAnyHeader()
                       .AllowAnyMethod()
                       .AllowCredentials()
                       .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
            });

            // Política restrictiva para endpoints administrativos
            options.AddPolicy("AdminCorsPolicy", builder =>
            {
                var adminOrigins = configuration.GetSection("Security:AdminAllowedOrigins").Get<string[]>()
                    ?? DefaultAdminOrigins;

                builder.SetIsOriginAllowed(origin => true)
                       .AllowAnyHeader()
                       .AllowAnyMethod()
                       .AllowCredentials();
            });
        });

        // Configurar Data Protection
        var keysPath = Path.Combine(environment.ContentRootPath, "keys", environment.EnvironmentName.ToLowerInvariant());
        var keysDirectory = new DirectoryInfo(keysPath);
        if (!keysDirectory.Exists)
        {
            keysDirectory.Create();
        }

        var dataProtectionBuilder = services.AddDataProtection()
                .PersistKeysToFileSystem(keysDirectory)
                .SetApplicationName("AuthDotnetApi")
                .SetDefaultKeyLifetime(TimeSpan.FromDays(90));

        if (environment.IsProduction())
        {
            // En producción deberías usar un certificado real
            // dataProtectionBuilder.ProtectKeysWithCertificate("thumbprint");
            if (OperatingSystem.IsWindows())
            {
                dataProtectionBuilder.ProtectKeysWithDpapi();
            }
            // En Linux/macOS en producción, usar certificados o Azure Key Vault
        }
        // En desarrollo no se cifra con DPAPI para evitar fallos al cambiar de usuario/permisos
        // (e.g. ejecutar IDE como admin y luego como usuario normal).

        // Configurar Antiforgery (CSRF Protection)
        services.AddAntiforgery(options =>
        {
            options.HeaderName = "X-CSRF-TOKEN";
            options.SuppressXFrameOptionsHeader = false;
            options.Cookie.Name = "__RequestVerificationToken";
            options.Cookie.HttpOnly = true;
            options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
            options.Cookie.SameSite = SameSiteMode.Strict;
        });

        return services;
    }

    public static IServiceCollection AddSecurityOptions(this IServiceCollection services)
    {
        services.Configure<CookiePolicyOptions>(options =>
        {
            options.CheckConsentNeeded = context => true;
            options.MinimumSameSitePolicy = SameSiteMode.Strict;
            options.HttpOnly = Microsoft.AspNetCore.CookiePolicy.HttpOnlyPolicy.Always;
            options.Secure = CookieSecurePolicy.SameAsRequest;
        });

        return services;
    }
}