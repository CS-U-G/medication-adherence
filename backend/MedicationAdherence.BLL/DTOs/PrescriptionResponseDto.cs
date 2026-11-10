using MedicationAdherence.DAL.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.BLL.DTOs
{
    public class PrescriptionResponseDto
    {
        public int PrescriptionId { get; set; }
        public int PatientId { get; set; }
        public string? PatientName { get; set; }
        public int DoctorId { get; set; }
        public string? DoctorName { get; set; }
        public string? DiagnosisNotes { get; set; }
        public DateTime IssuedDate { get; set; }
        public enPrescriptionStatus Status { get; set; }
        public List<PrescriptionItemResponseDto> Items { get; set; } = new List<PrescriptionItemResponseDto>();
    }
}
