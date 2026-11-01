using System;
using MedicationAdherence.DAL.Enums;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.DAL.Models
{
    public class PrescriptionItem
    {
        public int PrescriptionItemId { get; set; }
        public int PrescriptionId { get; set; }
        public int? MedicationId { get; set; }
        public string PrescribedMedName { get; set; }
        public string? ActualMedName { get; set; }
        public enMedicationSource MedicationSource { get; set; }
        public string Dosage {  get; set; }
        public short FrequencyPerDay { get; set; }
        public int DurationDays { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Instructions { get; set; }
        public enScheduleStatus ScheduleStatus { get; set; }

        public Prescription Prescription { get; set; } = null!;
        public Medication? Medication { get; set; }
        public ICollection<ItemScheduleTime> ItemScheduleTimes { get; set; } = new List<ItemScheduleTime>();
        public ICollection<DoseLog> DoseLogs { get; set; } = new List<DoseLog>();


    }
}
