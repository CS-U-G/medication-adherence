import { inject, Injectable } from '@angular/core';
import { StaffHttp, staffId } from './staff-http';

export const prescriptionStatuses = ['Active', 'Completed', 'Cancelled'] as const;
export type PrescriptionStatus = typeof prescriptionStatuses[number];
export type PrescriptionMedicationSource = 'PrescribedByDoctor' | 'AddedByPatient';
export type PrescriptionScheduleStatus = 'PendingSchedule' | 'Active' | 'Completed';

export interface CreatePrescriptionItemRequest {
  medicationId: number | null;
  prescribedMedName: string;
  dosage: string;
  frequencyPerDay: number;
  durationDays: number;
  startDate?: string | null;
  instructions?: string | null;
}

export interface CreatePrescriptionRequest {
  patientId: number;
  doctorId: number;
  diagnosisNotes: string | null;
  items: CreatePrescriptionItemRequest[];
}

export interface PrescriptionItemRecord extends Required<CreatePrescriptionItemRequest> {
  prescriptionItemId: number;
  prescriptionId: number;
  medicationSource: PrescriptionMedicationSource;
  endDate: string | null;
  scheduleStatus: PrescriptionScheduleStatus;
}

export interface PrescriptionRecord {
  prescriptionId: number;
  patientId: number;
  patientName: string | null;
  doctorId: number;
  doctorName: string | null;
  diagnosisNotes: string | null;
  issuedDate: string;
  status: PrescriptionStatus;
  items: PrescriptionItemRecord[];
}

export function prescriptionFrequency(frequencyPerDay: number): string {
  const labels = ['Once daily', 'Twice daily', 'Three times daily'];
  return labels[frequencyPerDay - 1] ?? `${frequencyPerDay} times daily`;
}

export function prescriptionMedicationSource(source: PrescriptionMedicationSource): 'Doctor-prescribed' | 'Patient-added' {
  return source === 'PrescribedByDoctor' ? 'Doctor-prescribed' : 'Patient-added';
}

function isPrescription(record: PrescriptionRecord | null): record is PrescriptionRecord {
  return !!record && Number.isInteger(record.prescriptionId) && record.prescriptionId > 0 &&
    Number.isInteger(record.patientId) && record.patientId > 0 &&
    Number.isInteger(record.doctorId) && record.doctorId > 0 &&
    (record.patientName === null || typeof record.patientName === 'string') &&
    typeof record.issuedDate === 'string' && prescriptionStatuses.includes(record.status) &&
    Array.isArray(record.items) && record.items.every(item =>
      !!item && item.prescriptionId === record.prescriptionId && Number.isInteger(item.prescriptionItemId) &&
      typeof item.prescribedMedName === 'string',
    );
}

@Injectable({ providedIn: 'root' })
export class PrescriptionApi {
  private readonly http = inject(StaffHttp);
  private readonly base = '/api/Prescriptions';

  async create(request: CreatePrescriptionRequest): Promise<PrescriptionRecord> {
    const record = await this.http.post<PrescriptionRecord | null>(`${this.base}/AddNew`, request);
    if (!isPrescription(record) || record.patientId !== request.patientId || record.doctorId !== request.doctorId) {
      throw new Error('The server did not confirm the prescription. Check the prescription list before trying again.');
    }
    return record;
  }

  async get(prescriptionId: number): Promise<PrescriptionRecord> {
    const record = await this.http.get<PrescriptionRecord | null>(`${this.base}/Prescription/${staffId(prescriptionId)}`);
    if (!isPrescription(record) || record.prescriptionId !== prescriptionId) {
      throw new Error('The server returned an unexpected prescription record.');
    }
    return record;
  }

  listByPatient(patientId: number): Promise<PrescriptionRecord[]> {
    return this.loadList('patient', patientId);
  }

  listByDoctor(doctorId: number): Promise<PrescriptionRecord[]> {
    return this.loadList('doctor', doctorId);
  }

  async updateStatus(prescriptionId: number, status: PrescriptionStatus): Promise<void> {
    const result = await this.http.put<{ message: string } | null>(
      `${this.base}/${staffId(prescriptionId)}/status`, null, { status },
    );
    if (typeof result?.message !== 'string' || !result.message.trim()) {
      throw new Error('The server did not confirm the prescription status update.');
    }
  }

  private async loadList(scope: 'patient' | 'doctor', id: number): Promise<PrescriptionRecord[]> {
    const records = await this.http.get<PrescriptionRecord[] | null>(`${this.base}/${scope}/${staffId(id)}`);
    const profile = scope === 'patient' ? 'patientId' : 'doctorId';
    if (!Array.isArray(records) || !records.every(record => isPrescription(record) && record[profile] === id)) {
      throw new Error('The server returned an unexpected prescription list.');
    }
    return records;
  }
}
