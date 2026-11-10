using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.BLL.DTOs
{
    public class AdherenceReportDto
    {
        public int PatientId { get; set; }
        public int TotalScheduledDoses { get; set; }
        public int TakenDoses { get; set; }
        public int SkippedDoses { get; set; }
        public int MissedDoses { get; set; }
        public decimal AdherencePercentage { get; set; }
    }
}
