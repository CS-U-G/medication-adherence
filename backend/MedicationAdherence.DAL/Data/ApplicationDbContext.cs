using MedicationAdherence.DAL.Models;
using Microsoft.EntityFrameworkCore;


namespace MedicationAdherence.DAL.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }




        
    }

}

