using MedicationAdherence.DAL.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.BLL.DTOs
{
    public class AuthResponseDto
    {
        public int UserId { get; set; }
        public int? DoctorId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public enUserRole Role { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
