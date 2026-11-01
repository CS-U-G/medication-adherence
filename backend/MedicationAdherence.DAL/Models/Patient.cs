using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.DAL.Models
{
    public class Patient
    {
        public int PatientId { get; set; }
        public int PersonId { get; set; }
        public string PatientAccessCode { get; set; }
        public int PrimaryDoctorId { get; set; }
        public string? MedicalNotes { get; set; }
        public bool IsActive { get; set; }

        public Person Person { get; set; } = null!;
        public Doctor PrimaryDoctor { get; set; } = null!;
        public ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();
        public ICollection<DoseLog> DoseLogs { get; set; } = new List<DoseLog>();

    }
}
