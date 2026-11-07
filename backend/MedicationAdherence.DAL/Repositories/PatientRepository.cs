using MedicationAdherence.DAL.Data;
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
    public class PatientRepository : IPatientRepository
    {
        private readonly ApplicationDbContext _context;

        public PatientRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Patient> AddPersonAndPatientAsync(Person person, Patient patient)
        {
            patient.Person = person; 

            await _context.Patients.AddAsync(patient);
            await _context.SaveChangesAsync();

            return patient;
        }

        public async Task<Patient?> GetPatientByAccessCodeAsync(string accessCode)
        {
            return await _context.Patients.Include(p => p.Person).Include(p => p.PrimaryDoctor).ThenInclude(d => d.User).ThenInclude(u => u.Person)
                .FirstOrDefaultAsync(p => p.PatientAccessCode == accessCode);
        }

        public async Task<Patient?> GetPatientByIdWithDetailsAsync(int patientId)
        {
            return await _context.Patients.Include(p => p.Person).Include(p => p.PrimaryDoctor).ThenInclude(d => d.User).ThenInclude(u => u.Person)
                .FirstOrDefaultAsync(p => p.PatientId == patientId);
        }

        public async Task<List<Patient>> GetPatientsByDoctorIdAsync(int doctorId)
        {
            return await _context.Patients.Include(p => p.Person).Where(p => p.PrimaryDoctorId == doctorId).ToListAsync();
        }

        public async Task<bool> AccessCodeExistsAsync(string accessCode)
        {
            return await _context.Patients.AnyAsync(p => p.PatientAccessCode == accessCode);
        }

        public async Task<string?> UpdatePatientAccessCodeAsync(int patientId, string newCode)
        {
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.PatientId == patientId);
            if (patient == null)
            {
                return null;
            }

            patient.PatientAccessCode = newCode;
            await _context.SaveChangesAsync();

            return newCode;
        }

        public async Task<bool> UpdatePatientAsync(Patient patient)
        {
            _context.Patients.Update(patient);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdatePatientStatusAsync(int patientId, bool isActive)
        {
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.PatientId == patientId);

            if (patient == null)
                return false;
            

            patient.IsActive = isActive;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
