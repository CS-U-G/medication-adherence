namespace MedicationAdherence.Api.Models
{
    public class MedicationSchedule
    {
        public int Id { get; set; }

        public int PrescriptionId { get; set; }

        public TimeOnly TimeOfDay { get; set; }

        public string Frequency { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public Prescription Prescription { get; set; } = null!;

        public ICollection<DoseRecord> DoseRecords { get; set; }
            = new List<DoseRecord>();

        public ICollection<Reminder> Reminders { get; set; }
            = new List<Reminder>();
    }
}
