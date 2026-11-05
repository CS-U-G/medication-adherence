using MedicationAdherence.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.DAL.Interfaces
{
    public interface IPatientRepository
    {
        Task<Patient> AddPersonAndPatientAsync(Person person, Patient patient);

        Task<Patient?> GetPatientByAccessCodeAsync(string accessCode);

        Task<Patient?> GetPatientByIdWithDetailsAsync(int patientId);

        Task<List<Patient>> GetPatientsByDoctorIdAsync(int doctorId);

        Task<bool> AccessCodeExistsAsync(string accessCode);

        Task<string?> UpdatePatientAccessCodeAsync(int patientId, string newCode);

        Task<bool> UpdatePatientAsync(Patient patient);

        Task<bool> UpdatePatientStatusAsync(int patientId, bool isActive);


    }
}
