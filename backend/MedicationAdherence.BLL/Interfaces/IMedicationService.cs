using MedicationAdherence.BLL.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MedicationAdherence.BLL.Interfaces
{
    public interface IMedicationService
    {
        Task<MedicationDto> AddMedicationAsync(CreateMedicationDto dto);
        Task<MedicationDto?> GetMedicationByIdAsync(int medicationId);
        Task<List<MedicationDto>> GetAllMedicationsAsync();
        Task<List<MedicationDto>> GetActiveMedicationsAsync();
        Task<bool> UpdateMedicationAsync(int medicationId, CreateMedicationDto dto);
        Task<bool> UpdateMedicationStatusAsync(int medicationId, bool isActive);
    }
}
