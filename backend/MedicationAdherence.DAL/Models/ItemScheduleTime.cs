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
        public short DoseOrder { get; set; }
        public TimeOnly ReminderTime { get; set; }

        public PrescriptionItem PrescriptionItem { get; set; } = null!;
    }
}
