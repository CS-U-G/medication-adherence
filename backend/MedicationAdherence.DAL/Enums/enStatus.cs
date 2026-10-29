using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.DAL.Enums
{
    public enum enStatus
    {
        Avtive = 1,
        Completed = 2,
        Cancelled = 4,

        Pending = 8,
        Taken = 16,
        Missed = 32,
    }
}
