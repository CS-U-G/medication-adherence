using MedicationAdherence.DAL.Enums;
using MedicationAdherence.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.DAL.Interfaces
{
    public interface IPrescriptionRepository
    {
        Task<Prescription> AddPrescriptionWithItemsAsync(Prescription prescription);

        Task<Prescription?> GetPrescriptionByIdWithDetailsAsync(int prescriptionId);

        Task<List<Prescription>> GetPrescriptionsByPatientIdAsync(int patientId);

        Task<List<Prescription>> GetPrescriptionsByDoctorIdAsync(int doctorId);

        Task<bool> UpdatePrescriptionStatusAsync(int prescriptionId, enPrescriptionStatus newStatus);

        Task<PrescriptionItem?> GetPrescriptionItemByIdAsync(int prescriptionItemId);
    }
}
