using MedicationAdherence.DAL.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.BLL.DTOs
{
    public class PatientDailyDoseDto
    {
        public long DoseLogId { get; set; }
        public int PatientId { get; set; }
        public int PrescriptionItemId { get; set; }
        public string PrescribedMedName { get; set; } = string.Empty;
        public string Dosage { get; set; } = string.Empty;
        public string? Instructions { get; set; }
        public enMedicationSource MedicationSource { get; set; }
        public DateTime ScheduledDateTime { get; set; }
        public enDoseStatus DoseStatus { get; set; }
        public DateTime? TakenAt { get; set; }
        public string? SkipReason { get; set; }
    }
}
