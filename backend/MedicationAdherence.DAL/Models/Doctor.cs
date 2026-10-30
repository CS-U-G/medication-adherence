using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.DAL.Models
{
    public class Doctor
    {
        public int DoctorId { get; set; }
        public int UserId { get; set; }
        public string Specialization {  get; set; }
        public string? LicenseNumber { get; set; }
        public User User { get; set; } = null!;

        public ICollection<Patient> Patients { get; set; }
            = new List<Patient>();

        public ICollection<Prescription> Prescriptions { get; set; }
            = new List<Prescription>();
    }
}
