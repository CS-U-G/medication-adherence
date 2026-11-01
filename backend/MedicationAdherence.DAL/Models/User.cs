using System;
using MedicationAdherence.DAL.Enums;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.DAL.Models
{
    public class User
    {
        public int UserId { get; set; }
        public int PersonId { get; set; }
        public string Email {  get; set; }
        public string PasswordHash { get; set; }
        public enUserRole Role { get; set; }
        public bool IsActive { get; set; }

        public Person Person { get; set; } = null!;
        public Doctor? Doctor { get; set; }
    }
}
