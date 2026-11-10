using MedicationAdherence.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.DAL.Interfaces
{
    public interface IDoseRepository
    {
        Task<bool> SaveScheduleAndGenerateDosesAsync(PrescriptionItem item, List<ItemScheduleTime> scheduleTimes, List<DoseLog> generatedDoses);

        Task<List<ItemScheduleTime>> GetScheduleTimesByItemIdAsync(int prescriptionItemId);

        Task UpdateMissedDosesForPatientAsync(int patientId);

        Task<List<DoseLog>> GetPatientDosesByDateAsync(int patientId, DateTime targetDate);

        Task<bool> MarkDoseAsTakenAsync(long doseLogId);

        Task<bool> MarkDoseAsSkippedAsync(long doseLogId, string skipReason);

        Task<List<DoseLog>> GetPatientDosesInPeriodAsync(int patientId, DateTime startDate, DateTime endDate);
    }
}
