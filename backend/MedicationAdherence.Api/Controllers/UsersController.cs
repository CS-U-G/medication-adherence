using MedicationAdherence.Api.Validators;
using MedicationAdherence.BLL.DTOs;
using MedicationAdherence.BLL.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MedicationAdherence.Api.Controllers
{
    [Route("api/users")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("user/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]

        public async Task<IActionResult> GetUserById(int id)
        {
            if(!ValidationHelper.IsValidId(id))
                return BadRequest(new {message = $"Not Valid id = {id}" });

            var userProfile = await _userService.GetUserByIdAsync(id);

            if (userProfile == null)
            {
                return NotFound(new { message = "User NOT Found." });
            }

            return Ok(userProfile);
        }

        [HttpPost("freeze/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Freeze(int id)
        {
            if (!ValidationHelper.IsValidId(id))
                return BadRequest(new { message = $"Not Valid id = {id}" });

            var Result = await _userService.FreezeUser(id);

            return Ok(Result);
        }

        [HttpPost("unfreeze/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UnFreeze(int id)
        {
            if (!ValidationHelper.IsValidId(id))
                return BadRequest(new { message = $"Not Valid id = {id}" });

            var Result = await _userService.UnfreezeUser(id);

            return Ok(Result);
        }

        [HttpGet("doctors")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetAllDoctors()
        {
            var doctors = await _userService.GetAllDoctorsAsync();

            if (doctors.Count == 0)
                return NotFound(new {messsage = "No Any Doctors."});

            return Ok(doctors);
        }

        [HttpPut("doctors/{doctorId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UpdateDoctorDetails(int doctorId, [FromBody] UpdateDoctorDto dto)
        {
            if (!ValidationHelper.IsValidId(doctorId) ||
                !ValidationHelper.IsNotEmpty(dto.FullName) ||
                !ValidationHelper.IsNotEmpty(dto.Specialization))
            {
                return BadRequest(new {message = "Data NOT Correct."});
            }

            bool isUpdated = await _userService.UpdateDoctorDetailsAsync(doctorId, dto);

            if (!isUpdated)
            {
                return BadRequest(new { message = "The doctor's information update failed. Please verify that the doctor's ID number and the entered information are correct." });
            }

            return Ok(new { message = "Data update successful." });
        }


        
    }
}
