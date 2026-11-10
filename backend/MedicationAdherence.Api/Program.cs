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

string connString = builder.Configuration
    .GetConnectionString("MedicationAdherenceDB")
    ?? throw new InvalidOperationException(
        "Database connection string is missing."
    );

builder.Services.AddDependencyInjections(connString);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

const string frontendCorsPolicy = "MedMinderFrontend";

var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy(frontendCorsPolicy, policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .WithMethods("GET", "POST", "PUT")
              .WithHeaders("Content-Type");
    });
});

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

app.UseRouting();
app.UseCors(frontendCorsPolicy);
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