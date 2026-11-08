using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.BLL.DTOs
{
    public class MedicationDto
    {
        public int MedicationId { get; set; }
        public string TradeName { get; set; } = string.Empty;
        public string? ScientificName { get; set; }
        public string? DosageForm { get; set; }
        public string? Strength { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
