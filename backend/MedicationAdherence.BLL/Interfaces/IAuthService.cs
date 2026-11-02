using MedicationAdherence.BLL.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicationAdherence.BLL.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto?> LoginWebUserAsync(WebLoginRequestDto dto);
        Task<AuthResponseDto?> SignInWebUserAsync(SignInDoctorDto dto);
    }
}
