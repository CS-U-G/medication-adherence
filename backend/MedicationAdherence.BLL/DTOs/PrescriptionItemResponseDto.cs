using MedicationAdherence.DAL.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.BLL.DTOs
{
    public class PrescriptionItemResponseDto
    {
        public int PrescriptionItemId { get; set; }
        public int PrescriptionId { get; set; }
        public int? MedicationId { get; set; }
        public string PrescribedMedName { get; set; } = string.Empty;
        public enMedicationSource MedicationSource { get; set; }
        public string Dosage { get; set; } = string.Empty;
        public int FrequencyPerDay { get; set; }
        public int DurationDays { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public string? Instructions { get; set; }
        public enScheduleStatus ScheduleStatus { get; set; }
    }
}
