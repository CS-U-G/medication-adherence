using MedicationAdherence.DAL.Data;
using MedicationAdherence.DAL.Interfaces;
using MedicationAdherence.DAL.Models;
using System;
using Microsoft.EntityFrameworkCore;

namespace MedicationAdherence.DAL.Repositories
{
    public class MedicationRepository : IMedicationRepository
    {
        private readonly ApplicationDbContext _context;

        public MedicationRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Medication> AddMedicationAsync(Medication medication)
        {
            await _context.Medications.AddAsync(medication);
            await _context.SaveChangesAsync();
            return medication;
        }

        public async Task<Medication?> GetMedicationByIdAsync(int medicationId)
        {
            return await _context.Medications
                .FirstOrDefaultAsync(m => m.MedicationId == medicationId);
        }

        public async Task<List<Medication>> GetAllMedicationsAsync()
        {
            return await _context.Medications
                .OrderBy(m => m.TradeName)
                .ToListAsync();
        }

        public async Task<List<Medication>> GetActiveMedicationsAsync()
        {
            return await _context.Medications
                .Where(m => m.IsActive == true)
                .OrderBy(m => m.TradeName)
                .ToListAsync();
        }

        public async Task<bool> UpdateMedicationAsync(Medication medication)
        {
            _context.Medications.Update(medication);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateMedicationStatusAsync(int medicationId, bool isActive)
        {
            var medication = await _context.Medications
                .FirstOrDefaultAsync(m => m.MedicationId == medicationId);

            if (medication == null)
            {
                return false;
            }

            medication.IsActive = isActive;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
