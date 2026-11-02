using System;
using MedicationAdherence.DAL.Models;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;
using MedicationAdherence.DAL.Data;
using Microsoft.EntityFrameworkCore;
using MedicationAdherence.DAL.Interfaces;

namespace MedicationAdherence.DAL.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context ) 
        {
            _context = context;
        }

        public async Task<User?> GetWebUserByEmailAsync(string email)
        {
            return await _context.Users.Include(u=> u.Person).Include(u => u.Doctor).FirstOrDefaultAsync(u=> u.Email == email);
        }

        public async Task<Doctor> AddPersonAndDoctorAsync(Person person, User user, Doctor doctor)
        {
            user.Person = person;
            doctor.User = user;

            await _context.Doctors.AddAsync(doctor);
            await _context.SaveChangesAsync();

            return doctor;
        }

        public async Task<User> AddPersonAndAdminAsync(Person person, User user)
        {
            user.Person = person;

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            return user;
        }
    }
}
