using MedicationAdherence.BLL.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

<<<<<<< HEAD
string connString = builder.Configuration.GetConnectionString("MedicationAdherenceDB")!;
=======
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


string connString = builder.Configuration
    .GetConnectionString("MedicationAdherenceDB")
    ?? throw new InvalidOperationException(
        "Database connection string is missing."
    ); 

>>>>>>> origin/main
builder.Services.AddDependencyInjections(connString);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment() ||
    builder.Configuration.GetValue<bool>("EnableSwagger"))
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthorization();
app.MapControllers();

app.MapGet("/", () => Results.Ok(new
{
    status = "online",
    service = "Medication Adherence API",
    version = "1.0"
}));

app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy"
}));

app.Run();