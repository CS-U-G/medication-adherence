using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.BLL.DTOs
{
    public class UpdatePatientDto
    {
        public string FullName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public char Gender { get; set; }
        public DateOnly DateOfBirth { get; set; }
        public string? MedicalNotes { get; set; }
    }
}
