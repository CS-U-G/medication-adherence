using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.BLL.DTOs
{
    public class CreatePrescriptionItemDto
    {
        public int? MedicationId { get; set; }
        public string PrescribedMedName { get; set; } = string.Empty;
        public string Dosage { get; set; } = string.Empty;
        public short FrequencyPerDay { get; set; }
        public int DurationDays { get; set; }
        public DateOnly? StartDate { get; set; }
        public string? Instructions { get; set; }
    }
}
