using MedicationAdherence.DAL.Models;
using Microsoft.EntityFrameworkCore;

namespace MedicationAdherence.DAL.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Person> People { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<Medication> Medications { get; set; }
        public DbSet<Prescription> Prescriptions { get; set; }
        public DbSet<PrescriptionItem> PrescriptionItems { get; set; }
        public DbSet<ItemScheduleTime> ItemScheduleTimes { get; set; }
        public DbSet<DoseLog> DoseLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Person>(entity =>
            {
                entity.ToTable("People");
                entity.HasKey(p => p.PersonId);
                entity.Property(p => p.FullName).IsRequired().HasMaxLength(100);
                entity.Property(p => p.PhoneNumber).HasMaxLength(20);
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");
                entity.HasKey(u => u.UserId);
                entity.Property(u => u.Email).IsRequired().HasMaxLength(150);
                entity.HasIndex(u => u.Email).IsUnique();

                entity.HasOne(u => u.Person)
                      .WithOne(p => p.User)
                      .HasForeignKey<User>(u => u.PersonId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Doctor>(entity =>
            {
                entity.ToTable("Doctors");
                entity.HasKey(d => d.DoctorId);
                entity.Property(d => d.Specialization).IsRequired().HasMaxLength(100);
                entity.Property(d => d.LicenseNumber).HasMaxLength(50);

                entity.HasOne(d => d.User)
                      .WithOne(u => u.Doctor)
                      .HasForeignKey<Doctor>(d => d.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Patient>(entity =>
            {
                entity.ToTable("Patients");
                entity.HasKey(pt => pt.PatientId);
                entity.Property(pt => pt.PatientAccessCode).IsRequired().HasMaxLength(20);
                entity.HasIndex(pt => pt.PatientAccessCode).IsUnique();

                entity.HasOne(pt => pt.Person)
                      .WithOne(p => p.Patient)
                      .HasForeignKey<Patient>(pt => pt.PersonId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(pt => pt.PrimaryDoctor)
                      .WithMany(d => d.Patients)
                      .HasForeignKey(pt => pt.PrimaryDoctorId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Medication>(entity =>
            {
                entity.ToTable("Medications");
                entity.HasKey(m => m.MedicationId);
                entity.Property(m => m.TradeName).IsRequired().HasMaxLength(120);
                entity.Property(m => m.ScientificName).IsRequired().HasMaxLength(150);
                entity.Property(m => m.DosageForm).IsRequired().HasMaxLength(50);
                entity.Property(m => m.Strength).HasMaxLength(50);
            });

            modelBuilder.Entity<Prescription>(entity =>
            {
                entity.ToTable("Prescriptions");
                entity.HasKey(pr => pr.PrescriptionId);
                entity.Property(pr => pr.DiagnosisNotes).HasMaxLength(500);

                entity.HasOne(pr => pr.Patient)
                      .WithMany(pt => pt.Prescriptions)
                      .HasForeignKey(pr => pr.PatientId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(pr => pr.Doctor)
                      .WithMany(d => d.Prescriptions)
                      .HasForeignKey(pr => pr.DoctorId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<PrescriptionItem>(entity =>
            {
                entity.ToTable("PrescriptionItems");
                entity.HasKey(pi => pi.PrescriptionItemId);
                entity.Property(pi => pi.PrescribedMedName).IsRequired().HasMaxLength(120);
                entity.Property(pi => pi.ActualMedName).HasMaxLength(120);
                entity.Property(pi => pi.Dosage).IsRequired().HasMaxLength(100);
                entity.Property(pi => pi.Instructions).HasMaxLength(300);

                entity.HasOne(pi => pi.Prescription)
                      .WithMany(pr => pr.PrescriptionItems)
                      .HasForeignKey(pi => pi.PrescriptionId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(pi => pi.Medication)
                      .WithMany(m => m.PrescriptionItems)
                      .HasForeignKey(pi => pi.MedicationId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<ItemScheduleTime>(entity =>
            {
                entity.ToTable("ItemScheduleTimes");
                entity.HasKey(st => st.ScheduleTimeId);

                entity.HasOne(st => st.PrescriptionItem)
                      .WithMany(pi => pi.ItemScheduleTimes)
                      .HasForeignKey(st => st.PrescriptionItemId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<DoseLog>(entity =>
            {
                entity.ToTable("DoseLogs");
                entity.HasKey(dl => dl.DoseLogId);
                entity.Property(dl => dl.SkipReason).HasMaxLength(250);

                entity.HasOne(dl => dl.PrescriptionItem)
                      .WithMany(pi => pi.DoseLogs)
                      .HasForeignKey(dl => dl.PrescriptionItemId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(dl => dl.Patient)
                      .WithMany(pt => pt.DoseLogs)
                      .HasForeignKey(dl => dl.PatientId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}

