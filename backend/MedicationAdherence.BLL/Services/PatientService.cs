using MedicationAdherence.BLL.DTOs;
using MedicationAdherence.BLL.Helpers;
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
    public class PatientService : IPatientService
    {
        private readonly IPatientRepository _patientRepository;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;

        public PatientService(IPatientRepository patientRepository, IJwtTokenGenerator jwtTokenGenerator)
        {
            _patientRepository = patientRepository;
            _jwtTokenGenerator = jwtTokenGenerator;
        }

        private async Task<string> GenerateUniqueAccessCodeAsync()
        {
            var random = new Random();
            string code;

            do
            {
                int randomNumber = random.Next(10000, 99999);
                code = $"PAT-{randomNumber}";
            }
            while (await _patientRepository.AccessCodeExistsAsync(code));

            return code;
        }

        public async Task<PatientDetailsDto?> RegisterPatientByDoctorAsync(CreatePatientDto dto)
        {
            

            string uniqueCode = await GenerateUniqueAccessCodeAsync();

            var person = new Person
            {
                FullName = dto.FullName,
                PhoneNumber = dto.PhoneNumber,
                Gender = dto.Gender,
                DateOfBirth = dto.DateOfBirth,
                CreatedAt = DateTime.UtcNow
            };

            var patient = new Patient
            {
                PatientAccessCode = uniqueCode,
                PrimaryDoctorId = dto.PrimaryDoctorId,
                MedicalNotes = dto.MedicalNotes,
                IsActive = true
            };

            var savedPatient = await _patientRepository.AddPersonAndPatientAsync(person, patient);

            return new PatientDetailsDto
            {
                PatientId = savedPatient.PatientId,
                PersonId = savedPatient.PersonId,
                FullName = person.FullName,
                PhoneNumber = person.PhoneNumber,
                Gender = person.Gender,
                DateOfBirth = person.DateOfBirth,
                PatientAccessCode = savedPatient.PatientAccessCode,
                PrimaryDoctorId = savedPatient.PrimaryDoctorId,
                MedicalNotes = savedPatient.MedicalNotes,
                IsActive = savedPatient.IsActive
            };
        }

        public async Task<PatientDetailsDto?> LoginPatientByCodeAsync(string accessCode)
        {

            var patient = await _patientRepository.GetPatientByAccessCodeAsync(accessCode.Trim());

            if (patient == null || !patient.IsActive)
            {
                return null;
            }

            var patientDto = MapToPatientDetailsDto(patient);

            patientDto.Token = _jwtTokenGenerator.GenerateToken(patient.PatientId, patient.Person.FullName, "Patient");

            return patientDto;
        }

        public async Task<PatientDetailsDto?> GetPatientByIdAsync(int patientId)
        {

            var patient = await _patientRepository.GetPatientByIdWithDetailsAsync(patientId);
            if (patient == null)
            {
                return null;
            }

            return MapToPatientDetailsDto(patient);
        }

        public async Task<List<PatientDetailsDto>> GetPatientsByDoctorIdAsync(int doctorId)
        {
            var patients = await _patientRepository.GetPatientsByDoctorIdAsync(doctorId);
            var resultList = new List<PatientDetailsDto>();

            foreach (var patient in patients)
            {
                resultList.Add(MapToPatientDetailsDto(patient));
            }

            return resultList;
        }

        public async Task<string?> RegenerateAccessCodeAsync(int patientId)
        {

            string newCode = await GenerateUniqueAccessCodeAsync();
            return await _patientRepository.UpdatePatientAccessCodeAsync(patientId, newCode);
        }

        public async Task<bool> UpdatePatientDetailsAsync(int patientId, UpdatePatientDto dto)
        {

            var patient = await _patientRepository.GetPatientByIdWithDetailsAsync(patientId);
            if (patient == null)
            {
                return false;
            }

            patient.Person.FullName = dto.FullName;
            patient.Person.PhoneNumber = dto.PhoneNumber;
            patient.Person.Gender = dto.Gender;
            patient.Person.DateOfBirth = dto.DateOfBirth;

            patient.MedicalNotes = dto.MedicalNotes;

            return await _patientRepository.UpdatePatientAsync(patient);
        }

        public async Task<bool> UpdatePatientStatusAsync(int patientId, bool isActive)
        {

            return await _patientRepository.UpdatePatientStatusAsync(patientId, isActive);
        }

        private PatientDetailsDto MapToPatientDetailsDto(Patient patient)
        {
            return new PatientDetailsDto
            {
                PatientId = patient.PatientId,
                PersonId = patient.PersonId,
                FullName = patient.Person.FullName,
                PhoneNumber = patient.Person.PhoneNumber,
                Gender = patient.Person.Gender,
                DateOfBirth = patient.Person.DateOfBirth,
                PatientAccessCode = patient.PatientAccessCode,
                PrimaryDoctorId = patient.PrimaryDoctorId,
                PrimaryDoctorName = patient.PrimaryDoctor?.User?.Person?.FullName,
                MedicalNotes = patient.MedicalNotes,
                IsActive = patient.IsActive
            };
        }
    }
}
