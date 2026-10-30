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
        PrescribedByDoctor = 1,   // بوصفة الطبيب كما هو
        SubstitutedByPatient = 2, // استبدله المريض ببديل تجاري من الصيدلية
        AddedByPatient = 3        // أضافه المريض بنفسه من الموبايل
    }

    public enum enScheduleStatus : short
    {
        PendingSchedule = 1,      // بانتظار ضبط المريض للساعات في الموبايل
        Active = 2,               // ضبط المريض الساعات وتم توليد الجرعات
        Completed = 3             // انتهت مدة العلاج
    }

    public enum enDoseStatus : short
    {
        Pending = 1,              // لم يحن وقتها بعد
        Taken = 2,                // تم أخذ الجرعة في وقتها
        Skipped = 3,              // تخطاها المريض مع ذكر السبب
        Missed = 4                // فائتة (مضى وقتها ولم يأخذها المريض)
    }
}
