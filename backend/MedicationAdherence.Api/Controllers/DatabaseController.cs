using MedicationAdherence.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MedicationAdherence.Api.Controllers;

[ApiController]
[Route("api/database")]
public class DatabaseController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DatabaseController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("test-connection")]
    public async Task<IActionResult> TestConnection()
    {
        try
        {
            bool connected =
                await _context.Database.CanConnectAsync();

            if (connected)
            {
                return Ok(new
                {
                    success = true,
                    message = "Connected to Neon PostgreSQL successfully."
                });
            }

            return StatusCode(503, new
            {
                success = false,
                message = "Could not connect to the database."
            });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine(
                $"Database connection test failed: {ex.Message}");

            return StatusCode(503, new
            {
                success = false,
                message = "Database connection failed. Check server logs and connection settings."
            });
        }
    }
}
