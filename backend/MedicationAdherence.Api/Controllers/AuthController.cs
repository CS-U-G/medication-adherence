using MedicationAdherence.BLL.DTOs;
using MedicationAdherence.BLL.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MedicationAdherence.Api.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("web-login")]
        public async Task<IActionResult> WebLogin([FromBody] WebLoginRequestDto dto)
        {
            var result = await _authService.LoginWebUserAsync(dto);

            if (result == null)
                return Unauthorized(new { message = "Invalid email, password, or Denait Access, Contact with support team." });
            

            return Ok(result);
        }

        [HttpPost("SignIn")]
        public async Task<IActionResult> SignIn([FromBody] SignInDoctorDto dto)
        {
            var result = await _authService.SignInWebUserAsync(dto);

            if (result == null)
                return Unauthorized(new { message = "Invalid email." });


            return Ok(result);
        }
    }
}
