using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.BLL.DTOs
{
    public class SignInDoctorDto
    {
        public string FullName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public char Gender { get; set; }
        public DateOnly DateOfBirth { get; set; }

        public string Email { get; set; } = string.Empty;

        [MinLength(8, ErrorMessage = "The password must be at least 8 characters long.")]
        [RegularExpression(@"^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$",
        ErrorMessage = "This password is weak! It must be at least 8 characters long and contain letters, numbers, and special characters (such as @#$%).")]
        public string Password { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public string? LicenseNumber { get; set; }
    }
}
