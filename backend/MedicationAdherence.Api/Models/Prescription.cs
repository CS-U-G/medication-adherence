namespace MedicationAdherence.Api.Models
{
    public class Prescription
    {
        public int Id { get; set; }

        public int PatientId { get; set; }

        public int MedicineId { get; set; }

        public string? Instructions { get; set; }

        public DateOnly StartDate { get; set; }

        public DateOnly EndDate { get; set; }

        public User Patient { get; set; } = null!;

        public Medicine Medicine { get; set; } = null!;

        public ICollection<MedicationSchedule> Schedules { get; set; }
            = new List<MedicationSchedule>();
    }
}
