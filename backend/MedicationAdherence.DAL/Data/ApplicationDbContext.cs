using MedicationAdherence.DAL.Models;
using Microsoft.EntityFrameworkCore;


namespace MedicationAdherence.DAL.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Medicine> Medicines => Set<Medicine>();
        public DbSet<Prescription> Prescriptions => Set<Prescription>();
        public DbSet<MedicationSchedule> MedicationSchedules => Set<MedicationSchedule>();
        public DbSet<DoseRecord> DoseRecords => Set<DoseRecord>();
        public DbSet<Reminder> Reminders => Set<Reminder>();
        public DbSet<Notification> Notifications => Set<Notification>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("USERS");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id)
                    .HasColumnName("Id")
                    .UseIdentityAlwaysColumn();

                entity.Property(e => e.Name)
                    .HasColumnName("Name")
                    .HasMaxLength(150)
                    .IsRequired();

                entity.Property(e => e.Email)
                    .HasColumnName("Email")
                    .HasMaxLength(256)
                    .IsRequired();

                entity.HasIndex(e => e.Email).IsUnique();

                entity.Property(e => e.PasswordHash)
                    .HasColumnName("PasswordHash")
                    .IsRequired();

                entity.Property(e => e.Role)
                    .HasColumnName("Role")
                    .HasMaxLength(30)
                    .HasDefaultValue("User");
            });

            modelBuilder.Entity<Medicine>(entity =>
            {
                entity.ToTable("MEDICINES");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id)
                    .HasColumnName("Id")
                    .UseIdentityAlwaysColumn();

                entity.Property(e => e.Name)
                    .HasColumnName("Name")
                    .HasMaxLength(200)
                    .IsRequired();

                entity.Property(e => e.Strength)
                    .HasColumnName("Strength")
                    .HasMaxLength(100)
                    .IsRequired();

                entity.Property(e => e.Form)
                    .HasColumnName("Form")
                    .HasMaxLength(100)
                    .IsRequired();
            });

            modelBuilder.Entity<Prescription>(entity =>
            {
                entity.ToTable("PRESCRIPTIONS", table =>
                {
                    table.HasCheckConstraint(
                        "CK_Prescriptions_Dates",
                        "\"EndDate\" >= \"StartDate\"");
                });

                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id)
                    .HasColumnName("Id")
                    .UseIdentityAlwaysColumn();

                entity.Property(e => e.PatientId)
                    .HasColumnName("PatientId")
                    .IsRequired();

                entity.Property(e => e.MedicineId)
                    .HasColumnName("MedicineId")
                    .IsRequired();

                entity.Property(e => e.Instructions)
                    .HasColumnName("Instructions");

                entity.Property(e => e.StartDate)
                    .HasColumnName("StartDate")
                    .HasColumnType("date");

                entity.Property(e => e.EndDate)
                    .HasColumnName("EndDate")
                    .HasColumnType("date");

                entity.HasIndex(e => e.PatientId);
                entity.HasIndex(e => e.MedicineId);

                entity.HasOne(e => e.Patient)
                    .WithMany(e => e.Prescriptions)
                    .HasForeignKey(e => e.PatientId)
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("FK_Prescriptions_Users");

                entity.HasOne(e => e.Medicine)
                    .WithMany(e => e.Prescriptions)
                    .HasForeignKey(e => e.MedicineId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FK_Prescriptions_Medicines");
            });

            modelBuilder.Entity<MedicationSchedule>(entity =>
            {
                entity.ToTable("MEDICATION_SCHEDULES");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id)
                    .HasColumnName("Id")
                    .UseIdentityAlwaysColumn();

                entity.Property(e => e.PrescriptionId)
                    .HasColumnName("PrescriptionId");

                entity.Property(e => e.TimeOfDay)
                    .HasColumnName("TimeOfDay")
                    .HasColumnType("time without time zone");

                entity.Property(e => e.Frequency)
                    .HasColumnName("Frequency")
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(e => e.IsActive)
                    .HasColumnName("IsActive")
                    .HasDefaultValue(true);

                entity.HasIndex(e => e.PrescriptionId);

                entity.HasOne(e => e.Prescription)
                    .WithMany(e => e.Schedules)
                    .HasForeignKey(e => e.PrescriptionId)
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("FK_Schedules_Prescriptions");
            });

            modelBuilder.Entity<DoseRecord>(entity =>
            {
                entity.ToTable("DOSE_RECORDS", table =>
                {
                    table.HasCheckConstraint(
                        "CK_DoseRecords_Status",
                        "\"Status\" IN ('Pending', 'Taken', 'Skipped', 'Missed')");

                    table.HasCheckConstraint(
                        "UQ_DoseRecords_Schedule_Time_Check",
                        "TRUE");
                });

                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id)
                    .HasColumnName("Id")
                    .UseIdentityAlwaysColumn();

                entity.Property(e => e.ScheduleId)
                    .HasColumnName("ScheduleId");

                entity.Property(e => e.ScheduledAt)
                    .HasColumnName("ScheduledAt")
                    .HasColumnType("timestamp with time zone");

                entity.Property(e => e.Status)
                    .HasColumnName("Status")
                    .HasMaxLength(20)
                    .HasDefaultValue("Pending");

                entity.Property(e => e.RecordedAt)
                    .HasColumnName("RecordedAt")
                    .HasColumnType("timestamp with time zone");

                entity.HasIndex(e => e.ScheduledAt);

                entity.HasIndex(e => new { e.ScheduleId, e.ScheduledAt })
                    .IsUnique()
                    .HasDatabaseName("UQ_DoseRecords_Schedule_Time");

                entity.HasOne(e => e.Schedule)
                    .WithMany(e => e.DoseRecords)
                    .HasForeignKey(e => e.ScheduleId)
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("FK_DoseRecords_Schedules");
            });

            modelBuilder.Entity<Reminder>(entity =>
            {
                entity.ToTable("REMINDERS");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id)
                    .HasColumnName("Id")
                    .UseIdentityAlwaysColumn();

                entity.Property(e => e.ScheduleId)
                    .HasColumnName("ScheduleId");

                entity.Property(e => e.ReminderTime)
                    .HasColumnName("ReminderTime")
                    .HasColumnType("time without time zone");

                entity.Property(e => e.IsEnabled)
                    .HasColumnName("IsEnabled")
                    .HasDefaultValue(true);

                entity.HasIndex(e => e.ScheduleId);

                entity.HasOne(e => e.Schedule)
                    .WithMany(e => e.Reminders)
                    .HasForeignKey(e => e.ScheduleId)
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("FK_Reminders_Schedules");
            });

            modelBuilder.Entity<Notification>(entity =>
            {
                entity.ToTable("NOTIFICATIONS");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id)
                    .HasColumnName("Id")
                    .UseIdentityAlwaysColumn();

                entity.Property(e => e.UserId)
                    .HasColumnName("UserId");

                entity.Property(e => e.Message)
                    .HasColumnName("Message")
                    .IsRequired();

                entity.Property(e => e.CreatedAt)
                    .HasColumnName("CreatedAt")
                    .HasColumnType("timestamp with time zone")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.Property(e => e.IsRead)
                    .HasColumnName("IsRead")
                    .HasDefaultValue(false);

                entity.HasIndex(e => new { e.UserId, e.CreatedAt })
                    .HasDatabaseName("IX_Notifications_UserId_CreatedAt");

                entity.HasIndex(e => e.UserId)
                    .HasDatabaseName("IX_Notifications_Unread")
                    .HasFilter("\"IsRead\" = FALSE");

                entity.HasOne(e => e.User)
                    .WithMany(e => e.Notifications)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("FK_Notifications_Users");
            });
        }
    }

}

