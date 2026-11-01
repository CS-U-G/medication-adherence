using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.DAL.Enums
{
    public enum enUserRole : short
    {
        Admin = 1,
        Doctor = 2
    }

    public enum enPrescriptionStatus : short
    {
        Active = 1,
        Completed = 2,
        Cancelled = 3
    }

    public enum enMedicationSource : short
    {
        PrescribedByDoctor = 1,  
        SubstitutedByPatient = 2,
        AddedByPatient = 3       
    }

    public enum enScheduleStatus : short
    {
        PendingSchedule = 1,
        Active = 2,         
        Completed = 3       
    }

    public enum enDoseStatus : short
    {
        Pending = 1,
        Taken = 2,  
        Skipped = 3,
        Missed = 4  
    }
}
