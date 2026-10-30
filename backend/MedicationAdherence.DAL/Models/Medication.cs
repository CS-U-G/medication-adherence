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
        public string TradeName { get; set; }
        public string ScientificName { get; set; }
        public string DosageForm { get; set; }
        public string? Strength { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public ICollection<PrescriptionItem> PrescriptionItems { get; set; }
        = new List<PrescriptionItem>();
    }
}
