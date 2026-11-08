using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.BLL.DTOs
{
    public class CreateMedicationDto
    {
        public string TradeName { get; set; } = string.Empty;
        public string ScientificName { get; set; } = string.Empty;
        public string DosageForm { get; set; } = string.Empty;
        public string? Strength { get; set; }    
    }
}
