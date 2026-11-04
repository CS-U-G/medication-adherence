
# syntax=docker/dockerfile:1

# ==========================================
# STAGE 1: BUILD
# ==========================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

# Copy project files first for NuGet caching
COPY MedicationAdherence.DAL/*.csproj MedicationAdherence.DAL/
COPY MedicationAdherence.BLL/*.csproj MedicationAdherence.BLL/
COPY MedicationAdherence.Api/*.csproj MedicationAdherence.Api/

# Restore API and referenced project dependencies
RUN dotnet restore "MedicationAdherence.Api/MedicationAdherence.Api.csproj"

# Copy the remaining backend source files
COPY . .

# Publish optimized Release output
RUN dotnet publish "MedicationAdherence.Api/MedicationAdherence.Api.csproj" \
    -c Release \
    -o /app/publish \
    --no-restore \
    /p:UseAppHost=false

# ==========================================
# STAGE 2: PRODUCTION RUNTIME
# ==========================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

WORKDIR /app

# Run in production mode on Render's default port
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://0.0.0.0:10000

EXPOSE 10000

# Copy only compiled application files
COPY --from=build /app/publish .

# Run as the built-in non-root .NET user
USER $APP_UID

# Start ASP.NET Core API
ENTRYPOINT ["dotnet", "MedicationAdherence.Api.dll"]
