using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.DAL.Models
{
    public class Medication
    {
        public int MedicationId { get; set; }
        public string TradeName { get; set; } = string.Empty;
        public string ScientificName { get; set; } = string.Empty;
        public string DosageForm { get; set; } = string.Empty;
        public string? Strength { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        public ICollection<PrescriptionItem> PrescriptionItems { get; set; } = new List<PrescriptionItem>();
    }
}
