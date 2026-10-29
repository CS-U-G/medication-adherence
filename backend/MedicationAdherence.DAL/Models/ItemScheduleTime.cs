using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.DAL.Models
{
    public class ItemScheduleTime
    {
        public int ScheduleTimeId { get; set; }
        public int PrescriptionItemId { get; set; }
        public byte DoseOrder { get; set; }
        public DateTime ReminderTime { get; set; }
    }
}
