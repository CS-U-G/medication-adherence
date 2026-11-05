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
            
            services.AddDbContext<ApplicationDbContext>(options => options.UseNpgsql(connectionString));

            services.AddScoped<IUserRepository, UserRepository>();

            services.AddScoped<IAuthService, AuthService>();

            services.AddScoped<IUserService, UserService>();

            services.AddScoped<IPasswordHasher, PasswordHasher>();

            // services.AddScoped<IPatientRepository, PatientRepository>();
            // services.AddScoped<IPrescriptionRepository, PrescriptionRepository>();
            // services.AddScoped<IDoseLogRepository, DoseLogRepository>();

           
            // services.AddScoped<IPatientService, PatientService>();
            // services.AddScoped<IPrescriptionService, PrescriptionService>();
            // services.AddScoped<IDoseTrackingService, DoseTrackingService>();

            return services;
        }
    }
}
