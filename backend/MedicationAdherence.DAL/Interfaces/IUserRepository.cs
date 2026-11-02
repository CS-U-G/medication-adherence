using MedicationAdherence.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.DAL.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetWebUserByEmailAsync(string email);
        
        Task<Doctor> AddPersonAndDoctorAsync(Person person, User user, Doctor doctor);

        Task<User> AddPersonAndAdminAsync(Person person, User user);
    }
}
