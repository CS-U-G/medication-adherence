using MedicationAdherence.BLL.Interfaces;
using BCrypt.Net;
using System;

namespace MedicationAdherence.BLL.Services
{
    public class PasswordHasher : IPasswordHasher
    {
        public string HashPassword(string plainPassword)
        {
            return BCrypt.Net.BCrypt.EnhancedHashPassword(plainPassword);
        }

        public bool VerifyPassword(string plainPassword, string hashedPasswordFromDb)
        {
            return BCrypt.Net.BCrypt.EnhancedVerify(plainPassword, hashedPasswordFromDb);
        }
    }
}
