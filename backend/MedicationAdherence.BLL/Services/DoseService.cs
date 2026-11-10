using MedicationAdherence.BLL.DTOs;
using MedicationAdherence.BLL.Interfaces;
using MedicationAdherence.DAL.Enums;
using MedicationAdherence.DAL.Interfaces;
using MedicationAdherence.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.BLL.Services
{
    public class DoseService : IDoseService
    {
        private readonly IDoseRepository _doseRepository;
        private readonly IPrescriptionRepository _prescriptionRepository;

        public DoseService(IDoseRepository doseRepository, IPrescriptionRepository prescriptionRepository)
        {
            _doseRepository = doseRepository;
            _prescriptionRepository = prescriptionRepository;
        }

        public async Task<bool> ConfigureMedicationScheduleAsync(ConfigureScheduleDto dto)
        {
            var item = await _prescriptionRepository.GetPrescriptionItemByIdAsync(dto.PrescriptionItemId);

            if (item == null || item.Prescription == null)
                return false;

            if (item.ScheduleStatus != enScheduleStatus.PendingSchedule)
                return false;

            if (dto.ReminderTimes.Count != item.FrequencyPerDay)
                return false;

            var scheduleTimes = new List<ItemScheduleTime>();
            var parsedTimes = new List<TimeOnly>();

            for (short i = 0; i < dto.ReminderTimes.Count; i++)
            {
                if (!TimeOnly.TryParse(dto.ReminderTimes[i], out TimeOnly parsedTime))
                {
                    return false;
                }

                parsedTimes.Add(parsedTime);

                scheduleTimes.Add(new ItemScheduleTime
                {
                    PrescriptionItemId = item.PrescriptionItemId,
                    DoseOrder = (short)(i + 1),
                    ReminderTime = parsedTime
                });
            }

            var generatedDoses = new List<DoseLog>();

            DateOnly startDate = item.StartDate ?? DateOnly.FromDateTime(DateTime.Now);

            for (int day = 0; day < item.DurationDays; day++)
            {
                DateOnly currentDay = startDate.AddDays(day);

                foreach (TimeOnly time in parsedTimes)
                {
                    DateTime scheduledDateTime = currentDay.ToDateTime(time);

                    generatedDoses.Add(new DoseLog
                    {
                        PrescriptionItemId = item.PrescriptionItemId,
                        PatientId = item.Prescription.PatientId,
                        ScheduledDateTime = scheduledDateTime,
                        Status = enDoseStatus.Pending,
                        CreatedAt = DateTime.Now
                    });
                }
            }

            return await _doseRepository.SaveScheduleAndGenerateDosesAsync(item, scheduleTimes, generatedDoses);
        }

        public async Task<List<PatientDailyDoseDto>> GetPatientDailyDosesAsync(int patientId, DateTime targetDate)
        {
            await _doseRepository.UpdateMissedDosesForPatientAsync(patientId);

            var doses = await _doseRepository.GetPatientDosesByDateAsync(patientId, targetDate);
            
            var resultList = new List<PatientDailyDoseDto>();

            foreach (var d in doses)
            {
                resultList.Add(new PatientDailyDoseDto
                {
                    DoseLogId = d.DoseLogId,
                    PatientId = d.PatientId,
                    PrescriptionItemId = d.PrescriptionItemId,
                    PrescribedMedName = d.PrescriptionItem.PrescribedMedName,
                    Dosage = d.PrescriptionItem.Dosage,
                    Instructions = d.PrescriptionItem.Instructions,
                    MedicationSource = d.PrescriptionItem.MedicationSource,
                    ScheduledDateTime = d.ScheduledDateTime,
                    DoseStatus = d.Status,
                    TakenAt = d.TakenAt,
                    SkipReason = d.SkipReason
                });
            }

            return resultList;
        }

        public async Task<bool> MarkDoseAsTakenAsync(long doseLogId)
        {
            return await _doseRepository.MarkDoseAsTakenAsync(doseLogId);
        }

        public async Task<bool> MarkDoseAsSkippedAsync(long doseLogId, string skipReason)
        {
            return await _doseRepository.MarkDoseAsSkippedAsync(doseLogId, skipReason.Trim());
        }

        public async Task<AdherenceReportDto?> GetPatientAdherenceReportAsync(int patientId, DateTime startDate, DateTime endDate)
        {
            await _doseRepository.UpdateMissedDosesForPatientAsync(patientId);

            var doses = await _doseRepository.GetPatientDosesInPeriodAsync(patientId, startDate, endDate);

            int totalDoses = doses.Count;
            int takenCount = 0;
            int skippedCount = 0;
            int missedCount = 0;

            foreach (var dose in doses)
            {
                if (dose.Status == enDoseStatus.Taken) 
                    takenCount++;
                else if (dose.Status == enDoseStatus.Skipped) 
                    skippedCount++;
                else if (dose.Status == enDoseStatus.Missed) 
                    missedCount++;
            }

            decimal percentage = 0;

            if (totalDoses > 0)
            {
                percentage = Math.Round(((decimal)takenCount / totalDoses) * 100, 2);
            }

            return new AdherenceReportDto
            {
                PatientId = patientId,
                TotalScheduledDoses = totalDoses,
                TakenDoses = takenCount,
                SkippedDoses = skippedCount,
                MissedDoses = missedCount,
                AdherencePercentage = percentage
            };
        }
    }
}
