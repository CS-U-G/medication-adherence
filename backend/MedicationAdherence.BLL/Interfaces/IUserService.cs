using MedicationAdherence.BLL.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.BLL.Interfaces
{
    public interface IUserService
    {
        Task<UserProfileDto?> GetUserByIdAsync(int userId);

        Task<bool> FreezeUser(int userId);

        Task<bool> UnfreezeUser(int userId);

        Task<List<UserProfileDto>> GetAllDoctorsAsync();

        Task<bool> UpdateDoctorDetailsAsync(int doctorId, UpdateDoctorDto dto);
    }
}
