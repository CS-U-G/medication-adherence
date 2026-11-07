using MedicationAdherence.BLL.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.BLL.Interfaces
{
    public interface IPatientService
    {
        Task<PatientDetailsDto?> RegisterPatientByDoctorAsync(CreatePatientDto dto);

        Task<PatientDetailsDto?> LoginPatientByCodeAsync(string accessCode);

        Task<PatientDetailsDto?> GetPatientByIdAsync(int patientId);

        Task<List<PatientDetailsDto>> GetPatientsByDoctorIdAsync(int doctorId);

        Task<string?> RegenerateAccessCodeAsync(int patientId);

        Task<bool> UpdatePatientDetailsAsync(int patientId, UpdatePatientDto dto);

        Task<bool> UpdatePatientStatusAsync(int patientId, bool isActive);
    }
}
