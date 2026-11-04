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

        public async Task<User?> GetUserByIdWithPersonAsync(int userId)
        {
            return await _context.Users.Include(p=> p.Person).Include(d=> d.Doctor).FirstOrDefaultAsync(u=> u.UserId == userId);
        }

        public async Task<bool> ToggleUserActiveStatusAsync(int userId, bool isActive)
        {
            var affectedRows = await _context.Users.Where(u => u.UserId == userId)
                .ExecuteUpdateAsync(setters => setters.SetProperty(u => u.IsActive, isActive));

            return affectedRows > 0;
        }

        public async Task<List<User>> GetAllDoctorsWithDetailsAsync()
        {
            return await _context.Users.Include(p=>p.Person).Include(d=>d.Doctor).Where(d=>d.Role == Enums.enUserRole.Doctor).ToListAsync();
        }

        public async Task<bool> UpdateDoctorDetailsAsync(int doctorId, string fullName, string? phoneNumber, string specialization, string? licenseNumber)
        {
            var doctor = await _context.Doctors.Include(d => d.User).ThenInclude(u => u.Person).FirstOrDefaultAsync(d => d.DoctorId == doctorId);

            if (doctor == null)
                return false;
            
            doctor.User.Person.FullName = fullName;
            doctor.User.Person.PhoneNumber = phoneNumber;

            doctor.Specialization = specialization;
            doctor.LicenseNumber = licenseNumber;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}
