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
    public class PrescriptionRepository : IPrescriptionRepository
    {
        private readonly ApplicationDbContext _context;

        public PrescriptionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Prescription> AddPrescriptionWithItemsAsync(Prescription prescription)
        {
            await _context.Prescriptions.AddAsync(prescription);
            await _context.SaveChangesAsync();

            return prescription;
        }

        public async Task<Prescription?> GetPrescriptionByIdWithDetailsAsync(int prescriptionId)
        {
            return await _context.Prescriptions.Include(p => p.PrescriptionItems).Include(p => p.Patient)
                .ThenInclude(pat => pat.Person).Include(p => p.Doctor).ThenInclude(doc => doc.User)
                .ThenInclude(u => u.Person).FirstOrDefaultAsync(p => p.PrescriptionId == prescriptionId);
        }

        public async Task<List<Prescription>> GetPrescriptionsByPatientIdAsync(int patientId)
        {
            return await _context.Prescriptions.Include(p => p.PrescriptionItems).Include(p => p.Patient)
                    .ThenInclude(pat => pat.Person).Include(p => p.Doctor).ThenInclude(doc => doc.User)
                    .ThenInclude(u => u.Person).Where(p => p.PatientId == patientId).OrderByDescending(p => p.IssuedDate).ToListAsync();
        }

        public async Task<List<Prescription>> GetPrescriptionsByDoctorIdAsync(int doctorId)
        {
            return await _context.Prescriptions.Include(p => p.PrescriptionItems).Include(p => p.Patient)
                    .ThenInclude(pat => pat.Person).Include(p => p.Doctor).ThenInclude(doc => doc.User)
                    .ThenInclude(u => u.Person).Where(p => p.DoctorId == doctorId)
                    .OrderByDescending(p => p.IssuedDate).ToListAsync();
        }

        public async Task<bool> UpdatePrescriptionStatusAsync(int prescriptionId, enPrescriptionStatus newStatus)
        {
            var prescription = await _context.Prescriptions.FirstOrDefaultAsync(p => p.PrescriptionId == prescriptionId);

            if (prescription == null)
                return false;
            

            prescription.Status = newStatus;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<PrescriptionItem?> GetPrescriptionItemByIdAsync(int prescriptionItemId)
        {
            return await _context.PrescriptionItems.Include(pi => pi.Prescription)
                .FirstOrDefaultAsync(pi => pi.PrescriptionItemId == prescriptionItemId);
        }
    }
}
