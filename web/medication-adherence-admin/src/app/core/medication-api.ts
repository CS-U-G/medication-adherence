import { inject, Injectable } from '@angular/core';
import { StaffHttp, staffId } from './staff-http';

export interface MedicationRequest {
  tradeName: string;
  scientificName: string;
  dosageForm: string;
  strength: string | null;
}

export interface MedicationRecord {
  medicationId: number;
  tradeName: string;
  scientificName: string | null;
  dosageForm: string | null;
  strength: string | null;
  isActive: boolean;
  createdAt: string;
}

const medications = '/api/Medications';

function isMedication(record: MedicationRecord | null): record is MedicationRecord {
  return !!record && Number.isInteger(record.medicationId) && record.medicationId > 0 &&
    typeof record.tradeName === 'string' && typeof record.createdAt === 'string' &&
    typeof record.isActive === 'boolean' && [record.scientificName, record.dosageForm, record.strength]
      .every(value => value === null || typeof value === 'string');
}

@Injectable({ providedIn: 'root' })
export class MedicationApi {
  private readonly http = inject(StaffHttp);

  list(): Promise<MedicationRecord[]> {
    return this.loadList('All');
  }

  active(): Promise<MedicationRecord[]> {
    return this.loadList('active');
  }

  async get(id: number): Promise<MedicationRecord> {
    const record = await this.http.get<MedicationRecord | null>(`${medications}/Medication/${staffId(id)}`);
    if (!isMedication(record) || record.medicationId !== id) {
      throw new Error('The server returned an unexpected medication record.');
    }
    return record;
  }

  async create(input: MedicationRequest): Promise<MedicationRecord> {
    const record = await this.http.post<MedicationRecord | null>(`${medications}/AddNew`, input);
    if (!isMedication(record)) {
      throw new Error('The server did not confirm the new medication. Reload the catalogue before trying again.');
    }
    return record;
  }

  async update(id: number, input: MedicationRequest): Promise<void> {
    const result = await this.http.put<{ message: string } | null>(`${medications}/Medication/${staffId(id)}`, input);
    if (!result?.message) throw new Error('The server did not confirm the medication update.');
  }

  async setActive(id: number, isActive: boolean): Promise<void> {
    const result = await this.http.put<{ message: string } | null>(`${medications}/${staffId(id)}/status`, null, { isActive });
    if (!result?.message) throw new Error('The server did not confirm the medication status update.');
  }

  private async loadList(path: 'All' | 'active'): Promise<MedicationRecord[]> {
    const records = await this.http.get<MedicationRecord[] | null>(`${medications}/${path}`);
    if (!Array.isArray(records) || !records.every(isMedication)) {
      throw new Error('The server returned an unexpected medication list.');
    }
    return records;
  }
}
