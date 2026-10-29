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

    }
}
