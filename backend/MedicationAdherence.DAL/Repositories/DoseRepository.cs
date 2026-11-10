using MedicationAdherence.DAL.Data;
using MedicationAdherence.DAL.Enums;
using MedicationAdherence.DAL.Interfaces;
using MedicationAdherence.DAL.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.DAL.Repositories
{
    public class DoseRepository : IDoseRepository
    {
        private readonly ApplicationDbContext _context;

        public DoseRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> SaveScheduleAndGenerateDosesAsync(PrescriptionItem item, List<ItemScheduleTime> scheduleTimes, List<DoseLog> generatedDoses)
        {
            await _context.ItemScheduleTimes.AddRangeAsync(scheduleTimes);

            await _context.DoseLogs.AddRangeAsync(generatedDoses);

            item.ScheduleStatus = enScheduleStatus.Active;
            _context.PrescriptionItems.Update(item);

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<ItemScheduleTime>> GetScheduleTimesByItemIdAsync(int prescriptionItemId)
        {
            return await _context.ItemScheduleTimes.Where(st => st.PrescriptionItemId == prescriptionItemId).OrderBy(st => st.DoseOrder).ToListAsync();
        }

        public async Task UpdateMissedDosesForPatientAsync(int patientId)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($"CALL public.\"sp_UpdateMissedDosesForPatient\"({patientId});");
        }

        public async Task<List<DoseLog>> GetPatientDosesByDateAsync(int patientId, DateTime targetDate)
        {
            DateTime startOfDay = targetDate.Date;
            DateTime endOfDay = startOfDay.AddDays(1).AddTicks(-1);

            return await _context.DoseLogs.Include(dl => dl.PrescriptionItem).Where(dl => dl.PatientId == patientId && dl.ScheduledDateTime >= startOfDay && dl.ScheduledDateTime <= endOfDay)
                .OrderBy(dl => dl.ScheduledDateTime).ToListAsync();
        }

        public async Task<bool> MarkDoseAsTakenAsync(long doseLogId)
        {
            bool exists = await _context.DoseLogs.AnyAsync(d => d.DoseLogId == doseLogId);
            if (!exists)
            {
                return false;
            }

            await _context.Database.ExecuteSqlInterpolatedAsync($"CALL public.\"sp_MarkDoseAsTaken\"({doseLogId});");

            return true;
        }

        public async Task<bool> MarkDoseAsSkippedAsync(long doseLogId, string skipReason)
        {
            bool exists = await _context.DoseLogs.AnyAsync(d => d.DoseLogId == doseLogId);
            if (!exists)
            {
                return false;
            }

            await _context.Database.ExecuteSqlInterpolatedAsync($"CALL public.\"sp_MarkDoseAsSkipped\"({doseLogId}, {skipReason});");

            return true;
        }

        public async Task<List<DoseLog>> GetPatientDosesInPeriodAsync(int patientId, DateTime startDate, DateTime endDate)
        {
            DateTime now = DateTime.Now;
            DateTime effectiveEndDate = endDate > now ? now : endDate;

            return await _context.DoseLogs.Where(dl => dl.PatientId == patientId && dl.ScheduledDateTime >= startDate && dl.ScheduledDateTime <= effectiveEndDate).ToListAsync();
        }
    }
}
