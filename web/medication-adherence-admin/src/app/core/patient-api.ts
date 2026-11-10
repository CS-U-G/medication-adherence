import { inject, Injectable } from '@angular/core';
import { StaffHttp, staffId } from './staff-http';

export interface PatientInputDto {
  fullName: string;
  phoneNumber: string | null;
  gender: string;
  dateOfBirth: string;
  medicalNotes: string | null;
}

export interface PatientRecord extends Omit<PatientInputDto, 'gender'> {
  patientId: number;
  personId: number;
  gender: string | null;
  patientAccessCode: string;
  primaryDoctorId: number;
  primaryDoctorName: string | null;
  isActive: boolean;
}

const patientsPath = '/api/patients';

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isNullableText(value: unknown): boolean {
  return value === null || typeof value === 'string';
}

function isPatient(record: PatientRecord | null): record is PatientRecord {
  return !!record && Number.isSafeInteger(record.patientId) && record.patientId > 0 &&
    Number.isSafeInteger(record.personId) && record.personId > 0 &&
    Number.isSafeInteger(record.primaryDoctorId) && record.primaryDoctorId > 0 &&
    hasText(record.fullName) && typeof record.isActive === 'boolean' &&
    typeof record.dateOfBirth === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(record.dateOfBirth) &&
    hasText(record.patientAccessCode) && isNullableText(record.phoneNumber) && isNullableText(record.medicalNotes) &&
    isNullableText(record.primaryDoctorName) &&
    (record.gender === null || (typeof record.gender === 'string' && record.gender.length === 1));
}

@Injectable({ providedIn: 'root' })
export class PatientApi {
  private readonly http = inject(StaffHttp);

  async listByDoctor(doctorId: number): Promise<PatientRecord[]> {
    const records = await this.http.get<PatientRecord[] | null>(`${patientsPath}/doctor/${staffId(doctorId)}`);
    if (!Array.isArray(records) || !records.every(record => isPatient(record) && record.primaryDoctorId === doctorId)) {
      throw new Error('The server returned an unexpected patient directory.');
    }
    return records;
  }

  async get(patientId: number): Promise<PatientRecord> {
    const record = await this.http.get<PatientRecord | null>(`${patientsPath}/${staffId(patientId)}`);
    if (!isPatient(record) || record.patientId !== patientId) {
      throw new Error('The server returned an unexpected patient record.');
    }
    return record;
  }

  async register(input: PatientInputDto & { primaryDoctorId: number }): Promise<PatientRecord> {
    staffId(input.primaryDoctorId);
    const record = await this.http.post<PatientRecord | null>(`${patientsPath}/register-by-doctor`, input);
    if (!isPatient(record) || record.primaryDoctorId !== input.primaryDoctorId) {
      throw new Error('The server did not confirm registration. Check the patient directory before trying again.');
    }
    return record;
  }

  async update(patientId: number, input: PatientInputDto): Promise<void> {
    const result = await this.http.put<{ message: string } | null>(`${patientsPath}/${staffId(patientId)}`, input);
    if (!hasText(result?.message)) throw new Error('The server did not confirm the patient information update.');
  }

  async setActive(patientId: number, isActive: boolean): Promise<void> {
    const result = await this.http.put<{ message: string } | null>(`${patientsPath}/${staffId(patientId)}/status`, null, { isActive });
    if (!hasText(result?.message)) throw new Error('The server did not confirm the patient status update.');
  }

  async regenerateCode(patientId: number): Promise<string> {
    const result = await this.http.put<{ patientId: number; newAccessCode: string } | null>(
      `${patientsPath}/${staffId(patientId)}/regenerate-code`, null,
    );
    if (result?.patientId !== patientId || !hasText(result.newAccessCode)) {
      throw new Error('The server did not confirm the replacement access code. Reload the record before trying again.');
    }
    return result.newAccessCode;
  }
}
