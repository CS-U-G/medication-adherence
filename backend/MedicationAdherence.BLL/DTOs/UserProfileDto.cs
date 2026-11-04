using MedicationAdherence.DAL.Enums;
using System;

namespace MedicationAdherence.BLL.DTOs
{
    public class UserProfileDto
    {
        public int UserId { get; set; }
        public int PersonId { get; set; }
        public int? DoctorId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public char? Gender { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public enUserRole Role { get; set; }
        public string? Specialization { get; set; }
        public string? LicenseNumber { get; set; }
        public bool IsActive { get; set; }
    }
}
