using MedicationAdherence.BLL.DTOs;
using MedicationAdherence.BLL.Interfaces;
using MedicationAdherence.DAL.Enums;
using MedicationAdherence.DAL.Interfaces;
using MedicationAdherence.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.BLL.Services
{
    public class PrescriptionService : IPrescriptionService
    {
        private readonly IPrescriptionRepository _prescriptionRepository;

        public PrescriptionService(IPrescriptionRepository prescriptionRepository)
        {
            _prescriptionRepository = prescriptionRepository;
        }

        public async Task<PrescriptionResponseDto?> CreatePrescriptionAsync(CreatePrescriptionDto dto)
        {
            var prescription = new Prescription
            {
                PatientId = dto.PatientId,
                DoctorId = dto.DoctorId,
                DiagnosisNotes = dto.DiagnosisNotes,
                IssuedDate = DateTime.UtcNow,
                Status = enPrescriptionStatus.Active
            };

            foreach (var itemDto in dto.Items)
            {
                DateOnly startDate = itemDto.StartDate ?? DateOnly.FromDateTime(DateTime.UtcNow);
                DateOnly endDate = startDate.AddDays(itemDto.DurationDays);

                var prescriptionItem = new PrescriptionItem
                {
                    MedicationId = itemDto.MedicationId,
                    PrescribedMedName = itemDto.PrescribedMedName.Trim(),
                    MedicationSource = enMedicationSource.PrescribedByDoctor,
                    Dosage = itemDto.Dosage.Trim(),
                    FrequencyPerDay = itemDto.FrequencyPerDay,
                    DurationDays = itemDto.DurationDays,
                    StartDate = startDate,
                    EndDate = endDate,
                    Instructions = itemDto.Instructions,
                    ScheduleStatus = enScheduleStatus.PendingSchedule
                };

                prescription.PrescriptionItems.Add(prescriptionItem);
            }

            var savedPrescription = await _prescriptionRepository.AddPrescriptionWithItemsAsync(prescription);

            var fullPrescription = await _prescriptionRepository.GetPrescriptionByIdWithDetailsAsync(savedPrescription.PrescriptionId);
            return MapToResponseDto(fullPrescription!);
        }

        public async Task<PrescriptionResponseDto?> GetPrescriptionByIdAsync(int prescriptionId)
        {
            var prescription = await _prescriptionRepository.GetPrescriptionByIdWithDetailsAsync(prescriptionId);
            
            if (prescription == null)
            {
                return null;
            }

            return MapToResponseDto(prescription);
        }

        public async Task<List<PrescriptionResponseDto>> GetPrescriptionsByPatientIdAsync(int patientId)
        {
            var prescriptions = await _prescriptionRepository.GetPrescriptionsByPatientIdAsync(patientId);
            
            var resultList = new List<PrescriptionResponseDto>();

            foreach (var p in prescriptions)
            {
                resultList.Add(MapToResponseDto(p));
            }

            return resultList;
        }

        public async Task<List<PrescriptionResponseDto>> GetPrescriptionsByDoctorIdAsync(int doctorId)
        {
            var prescriptions = await _prescriptionRepository.GetPrescriptionsByDoctorIdAsync(doctorId);
            
            var resultList = new List<PrescriptionResponseDto>();

            foreach (var p in prescriptions)
            {
                resultList.Add(MapToResponseDto(p));
            }

            return resultList;
        }

        public async Task<bool> UpdatePrescriptionStatusAsync(int prescriptionId, enPrescriptionStatus newStatus)
        {
            return await _prescriptionRepository.UpdatePrescriptionStatusAsync(prescriptionId, newStatus);
        }

        private PrescriptionResponseDto MapToResponseDto(Prescription p)
        {
            var dto = new PrescriptionResponseDto
            {
                PrescriptionId = p.PrescriptionId,
                PatientId = p.PatientId,
                PatientName = p.Patient?.Person?.FullName,
                DoctorId = p.DoctorId,
                DoctorName = p.Doctor?.User?.Person?.FullName,
                DiagnosisNotes = p.DiagnosisNotes,
                IssuedDate = p.IssuedDate,
                Status = p.Status
            };

            foreach (var item in p.PrescriptionItems)
            {
                dto.Items.Add(new PrescriptionItemResponseDto
                {
                    PrescriptionItemId = item.PrescriptionItemId,
                    PrescriptionId = item.PrescriptionId,
                    MedicationId = item.MedicationId,
                    PrescribedMedName = item.PrescribedMedName,
                    MedicationSource = item.MedicationSource,
                    Dosage = item.Dosage,
                    FrequencyPerDay = item.FrequencyPerDay,
                    DurationDays = item.DurationDays,
                    StartDate = item.StartDate,
                    EndDate = item.EndDate,
                    Instructions = item.Instructions,
                    ScheduleStatus = item.ScheduleStatus
                });
            }

            return dto;
        }
    }
}
