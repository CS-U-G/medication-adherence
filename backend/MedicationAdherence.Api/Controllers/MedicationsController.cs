using MedicationAdherence.Api.Validators;
using MedicationAdherence.BLL.DTOs;
using MedicationAdherence.BLL.Interfaces;
using MedicationAdherence.DAL.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MedicationAdherence.Api.Controllers
{
    [Authorize]
    [Route("api/Medications")]
    [ApiController]
    public class MedicationsController : ControllerBase
    {
        private readonly IMedicationService _medicationService;

        public MedicationsController(IMedicationService medicationService)
        {
            _medicationService = medicationService;
        }

        [Authorize(Roles = "Admin,Doctor")]
        [HttpPost("AddNew")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> AddMedication([FromBody] CreateMedicationDto dto)
        {
            if (!ValidationHelper.IsNotEmpty(dto.TradeName) 
                || !ValidationHelper.IsNotEmpty(dto.ScientificName) 
                || !ValidationHelper.IsNotEmpty(dto.DosageForm))
            {
                return BadRequest(new { message = "Failed to add the medication. Please make sure to enter the medication's brand name." }); ;
            }

            try
            {
                MedicationDto result = await _medicationService.AddMedicationAsync(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return Problem($"An unexpected error occurred on the server: {ex.Message}");
            }
        }

        [Authorize(Roles = "Admin,Doctor")]
        [HttpGet("All")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllMedications()
        {
            var medications = await _medicationService.GetAllMedicationsAsync();

            return Ok(medications);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("active")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetActiveMedications()
        {
            var medications = await _medicationService.GetActiveMedicationsAsync();
            return Ok(medications);
        }

        [Authorize(Roles = "Admin,Doctor")]
        [HttpGet("Medication/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetMedicationById(int id)
        {
            if (!ValidationHelper.IsValidId(id))
            {
                return NotFound(new { message = "The medication is not available." });
            }

            var medication = await _medicationService.GetMedicationByIdAsync(id);

            if (medication == null)
                return NotFound(new {message = "No medication found." });

            return Ok(medication);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("Medication/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateMedication(int id, [FromBody] CreateMedicationDto dto)
        {
            if (!ValidationHelper.IsValidId(id) || !ValidationHelper.IsNotEmpty(dto.TradeName)
                || !ValidationHelper.IsNotEmpty(dto.ScientificName)
                || !ValidationHelper.IsNotEmpty(dto.DosageForm))
            {
                return BadRequest(new { message = "The medication update failed. Please verify that the number and brand name are correct." });
            }

            bool isUpdated = await _medicationService.UpdateMedicationAsync(id, dto);

            if (!isUpdated)
                return NotFound(new { message = "Not Updated Successfully" });

            return Ok(new { message = "Successfully updated." });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/status")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateMedicationStatus(int id, [FromQuery] bool isActive)
        {
            if (!ValidationHelper.IsValidId(id))
            {
                return NotFound(new { message = "The medication is not available." });
            }

            bool isUpdated = await _medicationService.UpdateMedicationStatusAsync(id, isActive);

            if (!isUpdated)
            {
                return NotFound(new { message = "The medication is not available." });
            }

            return Ok(new { message = "Successfully updated." });
        }
    }
}
