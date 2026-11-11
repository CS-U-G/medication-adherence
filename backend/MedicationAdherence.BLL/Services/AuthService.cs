using MedicationAdherence.BLL.DTOs;
using MedicationAdherence.BLL.Helpers;
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
    internal class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;

        public AuthService(IUserRepository userRepository, IPasswordHasher passwordHasher, IJwtTokenGenerator jwtTokenGenerator)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _jwtTokenGenerator = jwtTokenGenerator;
        }

        public async Task<AuthResponseDto?> LoginWebUserAsync(WebLoginRequestDto dto)
        {
            var user = await _userRepository.GetWebUserByEmailAsync(dto.Email);

            if (user == null)
                return null;

            var verifyPassword = _passwordHasher.VerifyPassword(dto.Password, user.PasswordHash);

            if (!verifyPassword)
                return null;
            

            if (user.IsActive == false)
                return null;

            string token = _jwtTokenGenerator.GenerateToken(user.UserId, user.Person.FullName, user.Role.ToString());

            return new AuthResponseDto
            {
                UserId = user.UserId,
                DoctorId = user.Doctor?.DoctorId, 
                FullName = user.Person.FullName,
                Email = user.Email,
                Role = user.Role,
                Token = token,
                Message = "Login successful"
            };
        }

        public async Task<AuthResponseDto?> SignInWebUserAsync(SignInDoctorDto dto)
        {
            var existingUser = await _userRepository.GetWebUserByEmailAsync(dto.Email);

            if (existingUser != null)
            {
                return null;
            }

            var person = new Person
            {
                FullName = dto.FullName,
                PhoneNumber = dto.PhoneNumber,
                Gender = dto.Gender,
                DateOfBirth = dto.DateOfBirth,
                CreatedAt = DateTime.UtcNow
            };

            var user = new User
            {
                Email = dto.Email,
                PasswordHash = _passwordHasher.HashPassword(dto.Password),
                Role = enUserRole.Doctor,
                IsActive = true
            };

            var doctor = new Doctor
            {
                Specialization = dto.Specialization,
                LicenseNumber = dto.LicenseNumber

            };

            var savedDoctor = await _userRepository.AddPersonAndDoctorAsync(person, user, doctor);

            return new AuthResponseDto
            {
                UserId = savedDoctor.UserId,
                DoctorId = savedDoctor.DoctorId,
                FullName = person.FullName,
                Email = user.Email,
                Role = user.Role,
                Message = "Account created successfully"
            };
        }
    }
}
