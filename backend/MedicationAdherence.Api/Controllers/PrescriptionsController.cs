using MedicationAdherence.Api.Validators;
using MedicationAdherence.BLL.DTOs;
using MedicationAdherence.BLL.Interfaces;
using MedicationAdherence.DAL.Enums;
using MedicationAdherence.DAL.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MedicationAdherence.Api.Controllers
{
    [Authorize]
    [Route("api/Prescriptions")]
    [ApiController]
    public class PrescriptionsController : ControllerBase
    {
        private readonly IPrescriptionService _prescriptionService;

        public PrescriptionsController(IPrescriptionService prescriptionService)
        {
            _prescriptionService = prescriptionService;
        }

        [Authorize(Roles = "Doctor")]
        [HttpPost("AddNew")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreatePrescription([FromBody] CreatePrescriptionDto dto)
        {
            if (!ValidationHelper.IsValidId(dto.PatientId) ||
                !ValidationHelper.IsValidId(dto.DoctorId) ||
                dto.Items == null ||
                dto.Items.Count == 0)
            {
                return BadRequest(new { message = "Invalid Prescription Input." });
            }

            foreach (var itemDto in dto.Items)
            {
                if (!ValidationHelper.IsNotEmpty(itemDto.PrescribedMedName) ||
                    !ValidationHelper.IsNotEmpty(itemDto.Dosage) ||
                    !ValidationHelper.IsNumberInRange(itemDto.FrequencyPerDay, 1, 12) ||
                    itemDto.DurationDays < 1)
                {
                    return BadRequest(new { message = "Invalid Prescription Items Input." });
                }
            }

            var result = await _prescriptionService.CreatePrescriptionAsync(dto);

            if (result == null)
            {
                return BadRequest(new { message = "Failed to create the prescription. Make sure the patient's and doctor's ID numbers are correct, and that at least one medication has been entered with the correct information." });
            }

            return Ok(result);
        }

        [Authorize(Roles = "Doctor")]
        [HttpGet("Prescription/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetPrescriptionById(int id)
        {
            if (!ValidationHelper.IsValidId(id))
            {
                return BadRequest(new {message = "Invalid id Input."});
            }

            var prescription = await _prescriptionService.GetPrescriptionByIdAsync(id);

            if (prescription == null)
            {
                return NotFound(new { message = "The prescription is missing." });
            }

            return Ok(prescription);
        }

        [Authorize(Roles = "Doctor,Patient")]
        [HttpGet("patient/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetPrescriptionsByPatient(int id)
        {
            if(!ValidationHelper.IsValidId(id))
                return BadRequest(new {message = "Ivalid Id Input."});

            var prescriptions = await _prescriptionService.GetPrescriptionsByPatientIdAsync(id);
            return Ok(prescriptions);
        }

        [Authorize(Roles = "Doctor")]
        [HttpGet("doctor/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetPrescriptionsByDoctor(int id)
        {
            if (!ValidationHelper.IsValidId(id))
                return BadRequest(new { message = "Ivalid Id Input." });

            var prescriptions = await _prescriptionService.GetPrescriptionsByDoctorIdAsync(id);
            return Ok(prescriptions);
        }

        [Authorize(Roles = "Doctor")]
        [HttpPut("{id}/status")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdatePrescriptionStatus(int id, [FromQuery] enPrescriptionStatus status)
        {
            if (!ValidationHelper.IsValidId(id))
                return BadRequest(new {message = "Invalid Id Input"});
            
            bool isUpdated = await _prescriptionService.UpdatePrescriptionStatusAsync(id, status);

            if (!isUpdated)
            {
                return NotFound(new { message = "The prescription is missing." });
            }

            return Ok(new { message = "The prescription status has been successfully updated." });
        }
    }
}
