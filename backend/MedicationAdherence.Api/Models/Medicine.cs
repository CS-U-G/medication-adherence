namespace MedicationAdherence.Api.Models
{
    public class Medicine
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Strength { get; set; } = string.Empty;

        public string Form { get; set; } = string.Empty;

        public ICollection<Prescription> Prescriptions { get; set; }
            = new List<Prescription>();
    }
}
