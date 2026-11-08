using MedicationAdherence.Api.Validators;
using MedicationAdherence.BLL.DTOs;
using MedicationAdherence.BLL.Interfaces;
using MedicationAdherence.DAL.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MedicationAdherence.Api.Controllers
{
    [Route("api/Medications")]
    [ApiController]
    public class MedicationsController : ControllerBase
    {
        private readonly IMedicationService _medicationService;

        public MedicationsController(IMedicationService medicationService)
        {
            _medicationService = medicationService;
        }

        [HttpPost("AddNew")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> AddMedication([FromBody] CreateMedicationDto dto)
        {
            if (!ValidationHelper.IsNotEmpty(dto.TradeName) 
                || !ValidationHelper.IsNotEmpty(dto.ScientificName) 
                || !ValidationHelper.IsNotEmpty(dto.DosageForm))
            {
                return BadRequest(new { message = "Failed to add the medication. Please make sure to enter the medication's brand name." }); ;
            }

            var result = await _medicationService.AddMedicationAsync(dto);

            return Ok(result);
        }

        [HttpGet("All")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllMedications()
        {
            var medications = await _medicationService.GetAllMedicationsAsync();
            return Ok(medications);
        }

        [HttpGet("active")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetActiveMedications()
        {
            var medications = await _medicationService.GetActiveMedicationsAsync();
            return Ok(medications);
        }

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

            return Ok(medication);
        }

        [HttpPut("Medication/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UpdateMedication(int id, [FromBody] CreateMedicationDto dto)
        {
            if (!ValidationHelper.IsNotEmpty(dto.TradeName)
                || !ValidationHelper.IsNotEmpty(dto.ScientificName)
                || !ValidationHelper.IsNotEmpty(dto.DosageForm))
            {
                return BadRequest(new { message = "The medication update failed. Please verify that the number and brand name are correct." });
            }

            bool isUpdated = await _medicationService.UpdateMedicationAsync(id, dto);

            return Ok(new { message = "Successfully updated." });
        }

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
