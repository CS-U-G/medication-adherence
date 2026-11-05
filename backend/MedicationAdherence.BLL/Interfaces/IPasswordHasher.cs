using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.BLL.Interfaces
{
    public interface IPasswordHasher
    {
        public string HashPassword(string plainPassword);

        public bool VerifyPassword(string plainPassword, string hashedPasswordFromDb);
    }
}
