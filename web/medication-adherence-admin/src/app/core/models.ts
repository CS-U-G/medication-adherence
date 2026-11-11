export type Role = 'doctor' | 'admin';
export type AppMode = 'demo' | 'live';

export interface Session {
  id: string;
  name: string;
  email: string;
  role: Role;
  mode: AppMode;
  signedInAt: string;
  /** Backend issued bearer token; absent for fictional demo sessions. */
  token?: string;
  /** JWT expiry in milliseconds since epoch. */
  expiresAt?: number;
  userId?: number;
  doctorId?: number | null;
}

export interface CreateDoctor {
  name: string;
  email: string;
  specialty: string;
  phone: string;
  license: string;
  dob: string;
  gender: string;
  password: string;
}

export interface DoctorAccount extends Omit<CreateDoctor, 'password'> {
  id: string;
  active: boolean;
  createdAt: string;
}

export interface PatientInput {
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  notes: string;
}

export interface Patient extends PatientInput {
  id: string;
  doctorId: string;
  accessCode: string;
  createdAt: string;
}

export interface MedicationInput {
  name: string;
  strength: string;
  form: string;
  description: string;
}

export interface Medication extends MedicationInput {
  id: string;
  archived: boolean;
}

export interface PrescriptionItemInput {
  medicationId: string;
  dose: string;
  frequency: string;
  duration: number;
}

export interface PrescriptionItem extends PrescriptionItemInput {
  id: string;
  medicationName: string;
  source: 'Doctor-prescribed' | 'Patient-added' | 'Substituted';
}

export interface PrescriptionInput {
  patientId: string;
  notes: string;
  items: PrescriptionItemInput[];
}

export interface Prescription extends Omit<PrescriptionInput, 'items'> {
  id: string;
  doctorId: string;
  issuedAt: string;
  status: 'Active' | 'Completed' | 'Cancelled';
  items: PrescriptionItem[];
}

export interface Dose {
  id: string;
  patientId: string;
  medicationId: string;
  medicationName: string;
  date: string;
  status: 'Taken' | 'Skipped' | 'Missed';
}

export type ReportPeriod = 7 | 14 | 30 | 90;

export interface AdherenceCounts {
  taken: number;
  skipped: number;
  missed: number;
  due: number;
  rate: number | null;
}

export interface AdherenceDay extends AdherenceCounts {
  date: string;
  label: string;
}

export interface AdherenceMedication extends AdherenceCounts {
  name: string;
}

export interface AdherenceReport extends AdherenceCounts {
  days: AdherenceDay[];
  medications: AdherenceMedication[];
}
