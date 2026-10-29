using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MedicationAdherence.DAL.Data;
// using MedicationAdherence.DAL.Repositories;
// using MedicationAdherence.BLL.Interfaces;
// using MedicationAdherence.BLL.Services;

namespace MedicationAdherence.BLL.DependencyInjection
{
    public static class DependencyInjection
    {
        // هذه الدالة يستدعيها مشروع الـ API، وهي تتكفل بربط الـ DAL والـ BLL من الداخل
        public static IServiceCollection AddDependencyInjections(this IServiceCollection services, string connectionString)
        {
            // 1. تسجيل قاعدة بيانات PostgreSQL (الموجودة في DAL)
            services.AddDbContext<ApplicationDbContext>(options => options.UseNpgsql(connectionString));

            // 2. تسجيل الـ Repositories (الموجودة في DAL)
            // services.AddScoped<IPatientRepository, PatientRepository>();
            // services.AddScoped<IPrescriptionRepository, PrescriptionRepository>();
            // services.AddScoped<IDoseLogRepository, DoseLogRepository>();

            // 3. تسجيل الـ Services (الموجودة في BLL)
            // services.AddScoped<IPatientService, PatientService>();
            // services.AddScoped<IPrescriptionService, PrescriptionService>();
            // services.AddScoped<IDoseTrackingService, DoseTrackingService>();

            return services;
        }
    }
}
