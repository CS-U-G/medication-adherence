using MedicationAdherence.BLL.DTOs;
using MedicationAdherence.DAL.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.BLL.Interfaces
{
    public interface IPrescriptionService
    {
        Task<PrescriptionResponseDto?> CreatePrescriptionAsync(CreatePrescriptionDto dto);

        Task<PrescriptionResponseDto?> GetPrescriptionByIdAsync(int prescriptionId);

        Task<List<PrescriptionResponseDto>> GetPrescriptionsByPatientIdAsync(int patientId);

        Task<List<PrescriptionResponseDto>> GetPrescriptionsByDoctorIdAsync(int doctorId);

        Task<bool> UpdatePrescriptionStatusAsync(int prescriptionId, enPrescriptionStatus newStatus);
    }
}
