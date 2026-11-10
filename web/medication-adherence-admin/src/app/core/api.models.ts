/** Exact contracts from the ASP.NET controllers and DTOs. Preview models are separate. */
export interface WebLoginRequest { email: string; password: string; }
export interface RegisterDoctorRequest {
  fullName: string;
  phoneNumber: string | null;
  gender: string;
  dateOfBirth: string;
  email: string;
  password: string;
  specialization: string;
  licenseNumber: string | null;
}
export interface WebLoginResponse {
  userId: number;
  doctorId: number | null;
  fullName: string;
  email: string;
  role: 'Admin' | 'Doctor';
  message: string;
}
export interface HealthResponse { status: 'healthy'; }
