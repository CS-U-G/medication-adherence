using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.BLL.DTOs
{
    public class ConfigureScheduleDto
    {
        public int PrescriptionItemId { get; set; }
        public List<string> ReminderTimes { get; set; } = new List<string>();
    }
}
