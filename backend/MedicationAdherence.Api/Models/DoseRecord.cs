namespace MedicationAdherence.Api.Models
{
    public class DoseRecord
    {
        public int Id { get; set; }

        public int ScheduleId { get; set; }

        public DateTimeOffset ScheduledAt { get; set; }

        public string Status { get; set; } = "Pending";

        public DateTimeOffset? RecordedAt { get; set; }

        public MedicationSchedule Schedule { get; set; } = null!;
    }
}
