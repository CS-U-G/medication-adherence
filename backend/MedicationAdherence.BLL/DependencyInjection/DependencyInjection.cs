using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MedicationAdherence.DAL.Data;
using MedicationAdherence.DAL.Interfaces;
 using MedicationAdherence.DAL.Repositories;
using MedicationAdherence.BLL.Interfaces;
using MedicationAdherence.BLL.Services;

namespace MedicationAdherence.BLL.DependencyInjection
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddDependencyInjections(this IServiceCollection services, string connectionString)
        {
            AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

            services.AddDbContext<ApplicationDbContext>(options => options.UseNpgsql(connectionString));

            services.AddScoped<IUserRepository, UserRepository>();

            services.AddScoped<IAuthService, AuthService>();

            services.AddScoped<IUserService, UserService>();

            services.AddScoped<IPasswordHasher, PasswordHasher>();

            services.AddScoped<IPatientService, PatientService>();

            services.AddScoped<IPatientRepository, PatientRepository>();

            services.AddScoped<IMedicationRepository, MedicationRepository>();

            services.AddScoped<IMedicationService, MedicationService>();

            services.AddScoped<IPrescriptionRepository, PrescriptionRepository>();

            services.AddScoped<IPrescriptionService, PrescriptionService>();

            return services;
        }
    }
}
