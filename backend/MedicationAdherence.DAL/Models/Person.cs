using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.DAL.Models
{
    public class Person 
    {
        public int PersonId { get; set; }
        public string ?FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public char Gender { get; set; }
        public DateTime DateOfBirth { get; set; }
        public DateTime CreatedAt { get; set; }
        public User? User { get; set; }
        public Patient? Patient { get; set; }
    }
}
