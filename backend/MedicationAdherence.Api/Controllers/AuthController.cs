using MedicationAdherence.Api.Validators;
using MedicationAdherence.BLL.DTOs;
using MedicationAdherence.BLL.Interfaces;
using MedicationAdherence.BLL.Services;
using Microsoft.AspNetCore.Authorization;
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

        [AllowAnonymous]
        [HttpPost("web-login")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> WebLogin([FromBody] WebLoginRequestDto dto)
        {
            var result = await _authService.LoginWebUserAsync(dto);

            if (result == null)
                return Unauthorized(new { message = "Invalid email, password, or Denait Access, Contact with support team." });
            

            return Ok(result);
        }

        [AllowAnonymous]
        [HttpPost("SignIn")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> SignIn([FromBody] SignInDoctorDto dto)
        {
            if (!ValidationHelper.IsStrongPassword(dto.Password))
            {
                return BadRequest(new {message = @"The password must be at least 8 characters long. 
                                                    Or this password is weak! It must be at least 8 characters long and contain letters, numbers,
                                                    and special characters (such as @#$%)." });
            }

            var result = await _authService.SignInWebUserAsync(dto);

            if (result == null)
                return Unauthorized(new { message = "Invalid email." });


            return Ok(result);
        }
    }
}
