using MedicationAdherence.DAL.Models;
using System;

namespace MedicationAdherence.DAL.Interfaces
{
    public interface IMedicationRepository
    {
        Task<Medication> AddMedicationAsync(Medication medication);

        Task<Medication?> GetMedicationByIdAsync(int medicationId);

        Task<List<Medication>> GetAllMedicationsAsync();

        Task<List<Medication>> GetActiveMedicationsAsync();

        Task<bool> UpdateMedicationAsync(Medication medication);

        Task<bool> UpdateMedicationStatusAsync(int medicationId, bool isActive);
    }
}
