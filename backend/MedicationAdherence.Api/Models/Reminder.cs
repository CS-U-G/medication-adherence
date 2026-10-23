namespace MedicationAdherence.Api.Models
{
    public class Reminder
    {
        public int Id { get; set; }

        public int ScheduleId { get; set; }

        public TimeOnly ReminderTime { get; set; }

        public bool IsEnabled { get; set; } = true;

        public MedicationSchedule Schedule { get; set; } = null!;

    }
}
