namespace MedicationAdherence.Api.Models
{
    public class User
    {
        public int Id { get; set; }

        public string? Name { get; set; }

        public string? Email { get; set; }

        public string ?PasswordHash { get; set; }

        public string Role { get; set; } = "User";

        public ICollection<Prescription> Prescriptions { get; set; }
        = new List<Prescription>();

        public ICollection<Notification> Notifications { get; set; }
            = new List<Notification>();



    }
}
