using MedicationAdherence.BLL.DTOs;
using MedicationAdherence.BLL.Interfaces;
using MedicationAdherence.DAL.Interfaces;
using MedicationAdherence.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.BLL.Services
{
    public class MedicationService : IMedicationService
    {
        private readonly IMedicationRepository _medicationRepository;

        public MedicationService(IMedicationRepository medicationRepository)
        {
            _medicationRepository = medicationRepository;
        }

        public async Task<MedicationDto?> AddMedicationAsync(CreateMedicationDto dto)
        {
            var medication = new Medication
            {
                TradeName = dto.TradeName.Trim(),
                ScientificName = dto.ScientificName,
                DosageForm = dto.DosageForm,
                Strength = dto.Strength,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var savedMedication = await _medicationRepository.AddMedicationAsync(medication);

            return MapToDto(savedMedication);
        }

        public async Task<MedicationDto?> GetMedicationByIdAsync(int medicationId)
        {
            var medication = await _medicationRepository.GetMedicationByIdAsync(medicationId);
            if (medication == null)
            {
                return null;
            }

            return MapToDto(medication);
        }

        public async Task<List<MedicationDto>> GetAllMedicationsAsync()
        {
            var medications = await _medicationRepository.GetAllMedicationsAsync();
            var resultList = new List<MedicationDto>();

            foreach (var med in medications)
            {
                resultList.Add(MapToDto(med));
            }

            return resultList;
        }

        public async Task<List<MedicationDto>> GetActiveMedicationsAsync()
        {
            var medications = await _medicationRepository.GetActiveMedicationsAsync();
            var resultList = new List<MedicationDto>();

            foreach (var med in medications)
            {
                resultList.Add(MapToDto(med));
            }

            return resultList;
        }

        public async Task<bool> UpdateMedicationAsync(int medicationId, CreateMedicationDto dto)
        {
            var existingMed = await _medicationRepository.GetMedicationByIdAsync(medicationId);
            if (existingMed == null)
            {
                return false;
            }

            existingMed.TradeName = dto.TradeName.Trim();
            existingMed.ScientificName = dto.ScientificName;
            existingMed.DosageForm = dto.DosageForm;
            existingMed.Strength = dto.Strength;

            return await _medicationRepository.UpdateMedicationAsync(existingMed);
        }

        public async Task<bool> UpdateMedicationStatusAsync(int medicationId, bool isActive)
        {
            return await _medicationRepository.UpdateMedicationStatusAsync(medicationId, isActive);
        }

        private MedicationDto MapToDto(Medication med)
        {
            return new MedicationDto
            {
                MedicationId = med.MedicationId,
                TradeName = med.TradeName,
                ScientificName = med.ScientificName,
                DosageForm = med.DosageForm,
                Strength = med.Strength,
                IsActive = med.IsActive,
                CreatedAt = med.CreatedAt
            };
        }
    }
}
