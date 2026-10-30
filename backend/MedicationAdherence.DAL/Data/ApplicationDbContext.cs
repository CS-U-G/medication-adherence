using MedicationAdherence.DAL.Models;
using Microsoft.EntityFrameworkCore;

namespace MedicationAdherence.DAL.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Person> People => Set<Person>();
        public DbSet<User> Users => Set<User>();
        public DbSet<Doctor> Doctors => Set<Doctor>();
        public DbSet<Patient> Patients => Set<Patient>();
        public DbSet<Medication> Medications => Set<Medication>();
        public DbSet<Prescription> Prescriptions => Set<Prescription>();
        public DbSet<PrescriptionItem> PrescriptionItems => Set<PrescriptionItem>();
        public DbSet<ItemScheduleTime> ItemScheduleTimes => Set<ItemScheduleTime>();
        public DbSet<DoseLog> DoseLogs => Set<DoseLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            
           

            modelBuilder.Entity<Person>(entity =>
            {
                entity.ToTable("People");

                entity.HasKey(e => e.PersonId);

                entity.Property(e => e.PersonId)
                    .UseIdentityAlwaysColumn();

                entity.Property(e => e.FullName)
                    .HasMaxLength(100)
                    .IsRequired();

                entity.Property(e => e.PhoneNumber)
                    .HasMaxLength(20);

                entity.Property(e => e.Gender)
                    .HasColumnType("character(1)");

                entity.Property(e => e.DateOfBirth)
                    .HasColumnType("date");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .IsRequired();
            });

           

            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");

                entity.HasKey(e => e.UserId);

                entity.Property(e => e.UserId)
                    .UseIdentityAlwaysColumn();

                entity.Property(e => e.PersonId)
                    .IsRequired();

                entity.Property(e => e.Email)
                    .HasMaxLength(150)
                    .IsRequired();

                entity.Property(e => e.PasswordHash)
                    .HasMaxLength(255)
                    .IsRequired();

                entity.Property(e => e.Role)
                    .HasMaxLength(20)
                    .IsRequired();

                entity.Property(e => e.IsActive)
                    .HasDefaultValue(true)
                    .IsRequired();

                entity.HasIndex(e => e.PersonId)
                    .IsUnique();

                entity.HasIndex(e => e.Email)
                    .IsUnique();

                entity.HasOne(e => e.Person)
                    .WithOne(e => e.User)
                    .HasForeignKey<User>(e => e.PersonId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FK_Users_People");
            });

          

            modelBuilder.Entity<Doctor>(entity =>
            {
                entity.ToTable("Doctors");

                entity.HasKey(e => e.DoctorId);

                entity.Property(e => e.DoctorId)
                    .UseIdentityAlwaysColumn();

                entity.Property(e => e.UserId)
                    .IsRequired();

                entity.Property(e => e.Specialization)
                    .HasMaxLength(100)
                    .IsRequired();

                entity.Property(e => e.LicenseNumber)
                    .HasMaxLength(50);

                entity.HasIndex(e => e.UserId)
                    .IsUnique();

                entity.HasOne(e => e.User)
                    .WithOne(e => e.Doctor)
                    .HasForeignKey<Doctor>(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FK_Doctors_Users");
            });

           

            modelBuilder.Entity<Patient>(entity =>
            {
                entity.ToTable("Patients");

                entity.HasKey(e => e.PatientId);

                entity.Property(e => e.PatientId)
                    .UseIdentityAlwaysColumn();

                entity.Property(e => e.PersonId)
                    .IsRequired();

                entity.Property(e => e.PatientAccessCode)
                    .HasMaxLength(20)
                    .IsRequired();

                entity.Property(e => e.PrimaryDoctorId)
                    .IsRequired();

                entity.Property(e => e.MedicalNotes)
                    .HasMaxLength(500);

                entity.Property(e => e.IsActive)
                    .HasDefaultValue(true)
                    .IsRequired();

                entity.HasIndex(e => e.PersonId)
                    .IsUnique();

                entity.HasIndex(e => e.PatientAccessCode)
                    .IsUnique();

                entity.HasIndex(e => e.PrimaryDoctorId);

                entity.HasOne(e => e.Person)
                    .WithOne(e => e.Patient)
                    .HasForeignKey<Patient>(e => e.PersonId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FK_Patients_People");

                entity.HasOne(e => e.PrimaryDoctor)
                    .WithMany(e => e.Patients)
                    .HasForeignKey(e => e.PrimaryDoctorId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FK_Patients_Doctors");
            });

          

            modelBuilder.Entity<Medication>(entity =>
            {
                entity.ToTable("Medications");

                entity.HasKey(e => e.MedicationId);

                entity.Property(e => e.MedicationId)
                    .UseIdentityAlwaysColumn();

                entity.Property(e => e.TradeName)
                    .HasMaxLength(120)
                    .IsRequired();

                entity.Property(e => e.ScientificName)
                    .HasMaxLength(150)
                    .IsRequired();

                entity.Property(e => e.DosageForm)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(e => e.Strength)
                    .HasMaxLength(50);

                entity.Property(e => e.IsActive)
                    .HasDefaultValue(true)
                    .IsRequired();

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .IsRequired();
            });

            

            modelBuilder.Entity<Prescription>(entity =>
            {
                entity.ToTable("Prescriptions");

                entity.HasKey(e => e.PrescriptionId);

                entity.Property(e => e.PrescriptionId)
                    .UseIdentityAlwaysColumn();

                entity.Property(e => e.PatientId)
                    .IsRequired();

                entity.Property(e => e.DoctorId)
                    .IsRequired();

                entity.Property(e => e.DiagnosisNotes)
                    .HasMaxLength(500);

                entity.Property(e => e.IssuedDate)
                    .HasColumnType("timestamp without time zone")
                    .IsRequired();

                entity.Property(e => e.Status)
                    .HasMaxLength(20)
                    .IsRequired();

                entity.HasIndex(e => e.PatientId);
                entity.HasIndex(e => e.DoctorId);

                entity.HasOne(e => e.Patient)
                    .WithMany(e => e.Prescriptions)
                    .HasForeignKey(e => e.PatientId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FK_Prescriptions_Patients");

                entity.HasOne(e => e.Doctor)
                    .WithMany(e => e.Prescriptions)
                    .HasForeignKey(e => e.DoctorId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FK_Prescriptions_Doctors");
            });

            

            modelBuilder.Entity<PrescriptionItem>(entity =>
            {
                entity.ToTable("PrescriptionItems");

                entity.HasKey(e => e.PrescriptionItemId);

                entity.Property(e => e.PrescriptionItemId)
                    .UseIdentityAlwaysColumn();

                entity.Property(e => e.PrescriptionId)
                    .IsRequired();

                entity.Property(e => e.MedicationId);

                entity.Property(e => e.PrescribedMedName)
                    .HasMaxLength(120)
                    .IsRequired();

                entity.Property(e => e.ActualMedName)
                    .HasMaxLength(120);

                entity.Property(e => e.MedicationSource)
                    .HasMaxLength(30)
                    .IsRequired();

                entity.Property(e => e.Dosage)
                    .HasMaxLength(100)
                    .IsRequired();

                entity.Property(e => e.FrequencyPerDay)
                    .HasColumnType("smallint")
                    .IsRequired();

                entity.Property(e => e.DurationDays)
                    .IsRequired();

                entity.Property(e => e.StartDate)
                    .HasColumnType("date");

                entity.Property(e => e.EndDate)
                    .HasColumnType("date");

                entity.Property(e => e.Instructions)
                    .HasMaxLength(300);

                entity.Property(e => e.ScheduleStatus)
                    .HasMaxLength(25)
                    .IsRequired();

                entity.HasIndex(e => e.PrescriptionId);
                entity.HasIndex(e => e.MedicationId);

                entity.HasOne(e => e.Prescription)
                    .WithMany(e => e.PrescriptionItems)
                    .HasForeignKey(e => e.PrescriptionId)
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("FK_PrescriptionItems_Prescriptions");

                entity.HasOne(e => e.Medication)
                    .WithMany(e => e.PrescriptionItems)
                    .HasForeignKey(e => e.MedicationId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FK_PrescriptionItems_Medications");
            });

           

            modelBuilder.Entity<ItemScheduleTime>(entity =>
            {
                entity.ToTable("ItemScheduleTimes");

                entity.HasKey(e => e.ScheduleTimeId);

                entity.Property(e => e.ScheduleTimeId)
                    .UseIdentityAlwaysColumn();

                entity.Property(e => e.PrescriptionItemId)
                    .IsRequired();

                entity.Property(e => e.DoseOrder)
                    .HasColumnType("smallint")
                    .IsRequired();

                entity.Property(e => e.ReminderTime)
                    .HasColumnType("time without time zone")
                    .IsRequired();

                entity.HasIndex(e => e.PrescriptionItemId);

                entity.HasOne(e => e.PrescriptionItem)
                    .WithMany(e => e.ScheduleTimes)
                    .HasForeignKey(e => e.PrescriptionItemId)
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("FK_ItemScheduleTimes_Items");
            });

            

            modelBuilder.Entity<DoseLog>(entity =>
            {
                entity.ToTable("DoseLogs", table =>
                {
                    table.HasCheckConstraint(
                        "CK_DoseLogs_Status",
                        "\"Status\" IN ('Pending', 'Taken', 'Skipped', 'Missed')");
                });

                entity.HasKey(e => e.DoseLogId);

                entity.Property(e => e.DoseLogId)
                    .UseIdentityAlwaysColumn();

                entity.Property(e => e.PrescriptionItemId)
                    .IsRequired();

                entity.Property(e => e.PatientId)
                    .IsRequired();

                entity.Property(e => e.ScheduledDateTime)
                    .HasColumnType("timestamp without time zone")
                    .IsRequired();

                entity.Property(e => e.Status)
                    .HasMaxLength(20)
                    .HasDefaultValue("Pending")
                    .IsRequired();

                entity.Property(e => e.TakenAt)
                    .HasColumnType("timestamp without time zone");

                entity.Property(e => e.SkipReason)
                    .HasMaxLength(250);

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .IsRequired();

                entity.HasIndex(e => e.PrescriptionItemId);
                entity.HasIndex(e => e.PatientId);
                entity.HasIndex(e => e.ScheduledDateTime);

                entity.HasOne(e => e.PrescriptionItem)
                    .WithMany(e => e.DoseLogs)
                    .HasForeignKey(e => e.PrescriptionItemId)
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("FK_DoseLogs_Items");

                entity.HasOne(e => e.Patient)
                    .WithMany(e => e.DoseLogs)
                    .HasForeignKey(e => e.PatientId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FK_DoseLogs_Patients");
            });
        }
    }
}
