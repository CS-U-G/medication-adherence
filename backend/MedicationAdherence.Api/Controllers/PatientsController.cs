using MedicationAdherence.Api.Validators;
using MedicationAdherence.BLL.DTOs;
using MedicationAdherence.BLL.Interfaces;
using MedicationAdherence.DAL.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MedicationAdherence.Api.Controllers
{
    [Route("api/patients")]
    [ApiController]
    public class PatientsController : ControllerBase
    {
        private readonly IPatientService _patientService;

        public PatientsController(IPatientService patientService)
        {
            _patientService = patientService;
        }

        [HttpPost("register-by-doctor")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> RegisterPatient([FromBody] CreatePatientDto dto)
        {
            if (!ValidationHelper.IsNotEmpty(dto.FullName) || !ValidationHelper.IsValidId(dto.PrimaryDoctorId))
            {
                return Unauthorized(dto);
            }

            var result = await _patientService.RegisterPatientByDoctorAsync(dto);

            if (result == null)
            {
                return BadRequest(new { message = "Failed to add the patient. Make sure you entered the name and number of the attending physician correctly." });
            }

            return Ok(result);
        }

        [HttpPost("code-login")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> LoginByCode([FromBody] PatientCodeLoginDto dto)
        {
            if (!ValidationHelper.IsNotEmpty(dto.AccessCode))
            {
                return Unauthorized(new { message = "Invalid Access Code." });
            }

            var patient = await _patientService.LoginPatientByCodeAsync(dto.AccessCode);

            if (patient == null)
            {
                return Unauthorized(new { message = "The login code is incorrect or the account is inactive." });
            }

            return Ok(patient);
        }

        [HttpGet("{patientId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetPatientById(int patientId)
        {
            if (!ValidationHelper.IsValidId(patientId))
            {
                return NotFound(new { message = "The patient is not here" });
            }

            var patient = await _patientService.GetPatientByIdAsync(patientId);

            if (patient == null)
            {
                return NotFound(new { message = "The patient is not here" });
            }

            return Ok(patient);
        }

        [HttpGet("doctor/{doctorId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPatientsByDoctor(int doctorId)
        {
            if (!ValidationHelper.IsValidId(doctorId))
            {
                return NotFound(new { message = "The patient is not here" });
            }

            var patients = await _patientService.GetPatientsByDoctorIdAsync(doctorId);
            
            return Ok(patients);
        }

        [HttpPut("{patientId}/regenerate-code")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RegenerateAccessCode(int patientId)
        {
            if (!ValidationHelper.IsValidId(patientId))
            {
                return NotFound(new { message = "The patient is not here" });
            }

            var newCode = await _patientService.RegenerateAccessCodeAsync(patientId);

            if (newCode == null)
            {
                return NotFound(new { message = "The patient is not here" });
            }

            return Ok(new { patientId = patientId, newAccessCode = newCode, message = "A new access code has been successfully generated." });
        }

        [HttpPut("{patientId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UpdatePatient(int patientId, [FromBody] UpdatePatientDto dto)
        {
            if (!ValidationHelper.IsValidId(patientId) || !ValidationHelper.IsNotEmpty(dto.FullName))
            {
                return BadRequest(new { message = "The patient data update failed." });
            }

            bool isUpdated = await _patientService.UpdatePatientDetailsAsync(patientId, dto);

            if (!isUpdated)
            {
                return BadRequest(new { message = "The patient data update failed." });
            }

            return Ok(new { message = "The patient's information has been successfully updated." });
        }

        [HttpPut("{patientId}/status")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdatePatientStatus(int patientId, [FromQuery] bool isActive)
        {
            if (!ValidationHelper.IsValidId(patientId))
            {
                return NotFound(new { message = "The patient is not here" });
            }

            bool isUpdated = await _patientService.UpdatePatientStatusAsync(patientId, isActive);

            if (!isUpdated)
            {
                return NotFound(new { message = "The patient is not here" });
            }

            return Ok(new { message = "The patient's account status has been successfully updated." });
        }
    }
}
