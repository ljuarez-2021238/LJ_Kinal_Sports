using AuthService.Domain.Entities;
using AuthService.Application.Services;
using AuthService.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Persistence.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, bool resetAdminCredentials = false)
    {
        // Verificar si ya existen roles
        if (!(context.Roles?.Any() ?? false))
        {
            var roles = new List<Role>
            {
                new() {
                    Id = UuidGenerator.GenerateRoleId(),
                        Name = RoleConstants.ADMIN_ROLE
                },
                new() {
                    Id = UuidGenerator.GenerateRoleId(),
                        Name = RoleConstants.USER_ROLE
                }
            };

            await context.Roles!.AddRangeAsync(roles);
            await context.SaveChangesAsync();
        }

        // Garantizar usuario administrador por defecto
        if (context.Users is not null)
        {
            // Buscar rol admin existente
            var adminRole = await (context.Roles ?? throw new InvalidOperationException("Roles DbSet is null.")).FirstOrDefaultAsync(r => r.Name == RoleConstants.ADMIN_ROLE);
            if (adminRole != null)
            {
                var passwordHasher = new PasswordHashService();

                var adminUser = await context.Users
                    .Include(u => u.UserEmail)
                    .Include(u => u.UserRoles)
                    .FirstOrDefaultAsync(u => u.Username == "admin" || u.Email == "admin@ksports.local");

                if (adminUser == null)
                {
                    var userId = UuidGenerator.GenerateUserId();
                    var profileId = UuidGenerator.GenerateUserId();
                    var emailId = UuidGenerator.GenerateUserId();
                    var userRoleId = UuidGenerator.GenerateUserId();

                    adminUser = new User
                    {
                        Id = userId,
                        Name = "Admin",
                        Surname = "User",
                        Username = "admin",
                        Email = "admin@ksports.local",
                        Password = passwordHasher.HashPassword("Admin1234!"),
                        Status = true,
                        UserProfile = new UserProfile
                        {
                            Id = profileId,
                            UserId = userId,
                            ProfilePicture = string.Empty,
                            Phone = string.Empty
                        },
                        UserEmail = new UserEmail
                        {
                            Id = emailId,
                            UserId = userId,
                            EmailVerified = true,
                            EmailVerificationToken = null,
                            EmailVerificationTokenExpiry = null
                        },
                        UserRoles =
                        [
                            new UserRole
                            {
                                Id = userRoleId,
                                UserId = userId,
                                RoleId = adminRole.Id
                            }
                        ]
                    };

                    await context.Users.AddAsync(adminUser);
                }
                else if (resetAdminCredentials)
                {
                    // Solo en desarrollo: dejar credenciales conocidas para facilitar pruebas locales.
                    if (!passwordHasher.VerifyPassword("Admin1234!", adminUser.Password))
                    {
                        adminUser.Password = passwordHasher.HashPassword("Admin1234!");
                    }

                    adminUser.Status = true;

                    if (adminUser.UserEmail is not null)
                    {
                        adminUser.UserEmail.EmailVerified = true;
                        adminUser.UserEmail.EmailVerificationToken = null;
                        adminUser.UserEmail.EmailVerificationTokenExpiry = null;
                    }

                    var hasAdminRole = adminUser.UserRoles.Any(ur => ur.RoleId == adminRole.Id);
                    if (!hasAdminRole)
                    {
                        adminUser.UserRoles.Add(new UserRole
                        {
                            Id = UuidGenerator.GenerateUserId(),
                            UserId = adminUser.Id,
                            RoleId = adminRole.Id
                        });
                    }
                }

                await context.SaveChangesAsync();
            }
        }
    }
}