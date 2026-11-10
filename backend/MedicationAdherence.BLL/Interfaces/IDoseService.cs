using MedicationAdherence.BLL.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.BLL.Interfaces
{
    public interface IDoseService
    {
        Task<bool> ConfigureMedicationScheduleAsync(ConfigureScheduleDto dto);

        Task<List<PatientDailyDoseDto>> GetPatientDailyDosesAsync(int patientId, DateTime targetDate);

        Task<bool> MarkDoseAsTakenAsync(long doseLogId);

        Task<bool> MarkDoseAsSkippedAsync(long doseLogId, string skipReason);

        Task<AdherenceReportDto?> GetPatientAdherenceReportAsync(int patientId, DateTime startDate, DateTime endDate);
    }
}
