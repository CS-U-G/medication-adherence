using System;
using MedicationAdherence.DAL.Enums;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.DAL.Models
{
    public class Prescription
    {
        public int PrescriptionId { get; set; }
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public string? DiagnosisNotes { get; set; }
        public DateTime IssuedDate { get; set; }
        public enPrescriptionStatus Status { get; set; }
    }
}
