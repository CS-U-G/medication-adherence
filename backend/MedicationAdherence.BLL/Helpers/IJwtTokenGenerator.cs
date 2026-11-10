using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.BLL.Helpers
{
    public interface IJwtTokenGenerator
    {
        string GenerateToken(int id, string fullName, string role);
    }
}
