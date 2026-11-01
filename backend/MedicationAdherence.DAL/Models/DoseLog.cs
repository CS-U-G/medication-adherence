using System;
using MedicationAdherence.DAL.Enums;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.DAL.Models
{
    public class DoseLog
    {
        public long DoseLogId { get; set; }
        public int PrescriptionItemId { get; set; }
        public int PatientId { get; set; }
        public DateTime ScheduledDateTime { get; set; }
        public enDoseStatus Status { get; set; }
        public DateTime? TakenAt { get; set; }
        public string? SkipReason { get; set; }
        public DateTime CreatedAt { get; set; }

        public PrescriptionItem PrescriptionItem { get; set; } = null!;
        public Patient Patient { get; set; } = null!;
    }
}
