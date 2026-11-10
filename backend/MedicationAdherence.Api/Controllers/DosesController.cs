using MedicationAdherence.Api.Validators;
using MedicationAdherence.BLL.DTOs;
using MedicationAdherence.BLL.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MedicationAdherence.Api.Controllers
{
    [Authorize]
    [Route("api/Doses")]
    [ApiController]
    public class DosesController : ControllerBase
    {
        private readonly IDoseService _doseService;

        public DosesController(IDoseService doseService)
        {
            _doseService = doseService;
        }

        [Authorize(Roles = "Patient")]
        [HttpPost("configure-schedule")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ConfigureSchedule([FromBody] ConfigureScheduleDto dto)
        {
            if (!ValidationHelper.IsValidId(dto.PrescriptionItemId) || dto.ReminderTimes == null || dto.ReminderTimes.Count == 0)
                return BadRequest(new { message = "The schedule failed to create a time slot. Make sure the medication ID is correct, that the number of hours matches the specified number of daily doses, and that it has not already been scheduled." }); ;
            

            bool isConfigured = await _doseService.ConfigureMedicationScheduleAsync(dto);

            if (!isConfigured)
            {
                return BadRequest(new { message = "The schedule failed to create a time slot. Make sure the medication ID is correct, that the number of hours matches the specified number of daily doses, and that it has not already been scheduled." });
            }

            return Ok(new { message = "The reminder times have been saved, and the dosing schedule has been successfully generated." });
        }

        [Authorize(Roles = "Doctor,Patient")]
        [HttpGet("patient/{patientId}/daily")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetPatientDailyDoses(int patientId, [FromQuery] DateTime? date)
        {
            if (!ValidationHelper.IsValidId(patientId))
                return BadRequest(new {message = "Invalid patientId" });
            

            DateTime targetDate = date ?? DateTime.Now.Date;
           
            var doses = await _doseService.GetPatientDailyDosesAsync(patientId, targetDate);

            return Ok(doses);
        }

        [Authorize(Roles = "Patient")]
        [HttpPut("{doseLogId}/take")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> MarkDoseAsTaken(long doseLogId)
        {
            if (doseLogId <= 0)
            {
                return BadRequest("Invalid DoseId.");
            }

            bool isUpdated = await _doseService.MarkDoseAsTakenAsync(doseLogId);

            if (!isUpdated)
            {
                return NotFound(new { message = "The dosage record is missing." });
            }

            return Ok(new { message = "The dose has been successfully recorded." });
        }

        [Authorize(Roles = "Patient")]
        [HttpPut("{doseLogId}/skip")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> MarkDoseAsSkipped(long doseLogId, [FromBody] SkipDoseDto dto)
        {
            if (doseLogId <= 0 || !ValidationHelper.IsNotEmpty(dto.SkipReason))
            {
                return BadRequest("Invalid Dose Id or Skip Reason is empty.");
            }

            bool isUpdated = await _doseService.MarkDoseAsSkippedAsync(doseLogId, dto.SkipReason);

            if (!isUpdated)
            {
                return BadRequest(new { message = "Failed to record the missed dose. Make sure the dose number is correct and enter the reason for the missed dose." });
            }

            return Ok(new { message = "The overdose was recorded along with the cause." });
        }

        [Authorize(Roles = "Doctor,Patient")]
        [HttpGet("patient/{patientId}/report")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetAdherenceReport(int patientId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            if (!ValidationHelper.IsValidId(patientId) || endDate < startDate)
                return BadRequest(new { message = "Failed to retrieve the report. Please verify the patient's ID number and the dates of the period." });
            

            var report = await _doseService.GetPatientAdherenceReportAsync(patientId, startDate, endDate);

            if (report == null)
                return BadRequest(new { message = "Failed to retrieve the report. Please verify the patient's ID number and the dates of the period." });
            
            return Ok(report);
        }
    }
}
