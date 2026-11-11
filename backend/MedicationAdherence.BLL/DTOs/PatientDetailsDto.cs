using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.BLL.DTOs
{
    public class PatientDetailsDto
    {
        public int PatientId { get; set; }
        public int PersonId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public char? Gender { get; set; }
        public DateOnly DateOfBirth { get; set; }
        public string PatientAccessCode { get; set; } = string.Empty;
        public int PrimaryDoctorId { get; set; }
        public string? PrimaryDoctorName { get; set; }
        public string? MedicalNotes { get; set; }
        public bool IsActive { get; set; }
        public string? Token { get; set; }
    }
}
