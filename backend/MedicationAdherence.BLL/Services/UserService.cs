using MedicationAdherence.BLL.DTOs;
using MedicationAdherence.BLL.Interfaces;
using MedicationAdherence.DAL.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.BLL.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<UserProfileDto?> GetUserByIdAsync(int userId)
        {
            var user = await _userRepository.GetUserByIdWithPersonAsync(userId);

            if (user == null)
            {
                return null;
            }

            return new UserProfileDto
            {
                UserId = user.UserId,
                PersonId = user.PersonId,
                DoctorId = user.Doctor?.DoctorId,
                FullName = user.Person.FullName,
                Email = user.Email,
                PhoneNumber = user.Person.PhoneNumber,
                Gender = user.Person.Gender,
                DateOfBirth = user.Person.DateOfBirth,
                Role = user.Role,
                Specialization = user.Doctor?.Specialization,
                LicenseNumber = user.Doctor?.LicenseNumber,
                IsActive = user.IsActive
            };
        }

        public async Task<bool> FreezeUser(int userId)
        {
            return await _userRepository.ToggleUserActiveStatusAsync(userId, false);
        }

        public async Task<bool> UnfreezeUser(int userId)
        {
            return await _userRepository.ToggleUserActiveStatusAsync(userId, true);
        }

        public async Task<List<UserProfileDto>> GetAllDoctorsAsync()
        {
            var doctorsUsers = await _userRepository.GetAllDoctorsWithDetailsAsync();

            var resultList = new List<UserProfileDto>();

            if (doctorsUsers.Count == 0)
                return resultList;

            foreach (var user in doctorsUsers)
            {
                var dto = new UserProfileDto
                {
                    UserId = user.UserId,
                    PersonId = user.PersonId,
                    DoctorId = user.Doctor?.DoctorId,
                    FullName = user.Person.FullName,
                    Email = user.Email,
                    PhoneNumber = user.Person.PhoneNumber,
                    Gender = user.Person.Gender,
                    DateOfBirth = user.Person.DateOfBirth,
                    Role = user.Role,
                    Specialization = user.Doctor?.Specialization,
                    LicenseNumber = user.Doctor?.LicenseNumber,
                    IsActive = user.IsActive
                };

                resultList.Add(dto);
            }

            return resultList;
        }

        public async Task<bool> UpdateDoctorDetailsAsync(int doctorId, UpdateDoctorDto dto)
        {
            return await _userRepository.UpdateDoctorDetailsAsync(doctorId, dto.FullName, dto.PhoneNumber, dto.Specialization, dto.LicenseNumber);
        }
    }
}
