import { computed, inject, Injectable, Injector } from '@angular/core';
import { AuthService } from './auth.service';
import { storeDemoPassword } from './demo-password';
import { DemoStore } from './demo-store';
import {
  AdherenceReport, CreateDoctor, DoctorAccount, Medication, MedicationInput, Patient,
  PatientInput, Prescription, PrescriptionInput, ReportPeriod, Role,
} from './models';
import { buildReport, localDateKey } from './report';

function randomNumber(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0];
}

function recordId(prefix: string, existing: readonly { id: string }[]): string {
  let id: string;
  do {
    id = `${prefix}-${randomNumber().toString(36).toUpperCase().padStart(7, '0')}`;
  } while (existing.some(record => record.id === id));
  return id;
}

function validateBirthDate(date: string): void {
  const parsed = new Date(`${date}T12:00:00`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || localDateKey(parsed) !== date || date > localDateKey(new Date())) {
    throw new Error('Enter a valid date of birth that is today or earlier.');
  }
}

function emailAddress(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(normalized)) throw new Error('Enter a valid email address.');
  return normalized;
}

@Injectable({ providedIn: 'root' })
export class MedMinderData {
  private readonly auth = inject(AuthService);
  private readonly injector = inject(Injector);
  private get store(): DemoStore { return this.injector.get(DemoStore); }
  private readonly demoSession = computed(() => {
    const session = this.auth.session();
    return session?.mode === 'demo' ? session : null;
  });

  readonly doctors = computed<readonly DoctorAccount[]>(() => {
    const session = this.demoSession();
    if (!session) return [];
    if (session.role === 'admin') return this.store.state().doctors;
    return this.store.state().doctors.filter(account => account.id === session.id);
  });

  readonly patients = computed<readonly Patient[]>(() => {
    const session = this.demoSession();
    if (!session) return [];
    if (session.role === 'admin') return this.store.state().patients;
    return this.store.state().patients.filter(patient => patient.doctorId === session.id);
  });

  readonly prescriptions = computed<readonly Prescription[]>(() => {
    const session = this.demoSession();
    if (!session) return [];
    if (session.role === 'admin') return this.store.state().prescriptions;
    return this.store.state().prescriptions.filter(prescription => prescription.doctorId === session.id);
  });

  readonly medications = computed<readonly Medication[]>(() =>
    this.demoSession() ? this.store.state().medications : [],
  );

  readonly doses = computed(() => {
    if (!this.demoSession()) return [];
    const patientIds = new Set(this.patients().map(patient => patient.id));
    return this.store.state().doses.filter(dose => patientIds.has(dose.patientId));
  });

  aggregate(period: ReportPeriod = 7): AdherenceReport {
    return buildReport(this.doses(), period);
  }

  report(patientId: string, period: ReportPeriod = 7): AdherenceReport {
    return buildReport(this.doses().filter(dose => dose.patientId === patientId), period);
  }

  registerPatient(input: PatientInput): Patient {
    const session = this.requireDemoRole('doctor');
    const state = this.store.state();
    const name = input.name.trim();
    const email = emailAddress(input.email);
    if (!name) throw new Error('Enter the patient’s full name.');
    validateBirthDate(input.dob);
    if (state.patients.some(patient => patient.email === email)) {
      throw new Error('A patient already uses this email address.');
    }

    let accessCode: string;
    do {
      accessCode = `MM-${String(randomNumber() % 1000000).padStart(6, '0')}`;
    } while (state.patients.some(patient => patient.accessCode === accessCode));

    const patient: Patient = {
      ...input, name, email, phone: input.phone.trim(), notes: input.notes.trim(),
      id: recordId('PT', state.patients),
      doctorId: session.id, accessCode,
      createdAt: new Date().toISOString(),
    };
    this.store.replace({ ...state, patients: [patient, ...state.patients] });
    return patient;
  }

  issuePrescription(input: PrescriptionInput): Prescription {
    const session = this.requireDemoRole('doctor');
    const state = this.store.state();
    const patient = this.patients().find(person => person.id === input.patientId);
    if (!patient) throw new Error('Choose a patient in your directory.');
    if (!input.items.length) throw new Error('Add at least one medication.');

    const id = recordId('RX', state.prescriptions);
    const items = input.items.map((item, index) => {
      const medication = state.medications.find(entry => entry.id === item.medicationId && !entry.archived);
      if (!medication) throw new Error('Choose a medication that is available in the catalogue.');
      if (!item.dose.trim() || !item.frequency.trim() || !Number.isInteger(item.duration) || item.duration < 1) {
        throw new Error('Enter a dose, frequency, and duration in whole days for each medication.');
      }
      return {
        ...item,
        id: `${id}-${index + 1}`,
        dose: item.dose.trim(),
        medicationName: medication.name,
        source: 'Doctor-prescribed' as const,
      };
    });

    const prescription: Prescription = {
      id,
      patientId: patient.id,
      doctorId: session.id,
      notes: input.notes.trim(),
      issuedAt: new Date().toISOString(),
      status: 'Active',
      items,
    };
    // A prescription alone does not schedule doses. The patient chooses reminder times in the app.
    this.store.replace({ ...state, prescriptions: [prescription, ...state.prescriptions] });
    return prescription;
  }

  async createDoctor(input: CreateDoctor): Promise<DoctorAccount> {
    const session = this.requireDemoRole('admin');
    const { name, email, specialty, phone, license, dob, gender, password } = input;
    const normalized = emailAddress(email);
    if (!name.trim() || !specialty.trim()) throw new Error('Enter the doctor’s name and specialty.');
    if (password.length < 8) throw new Error('Use at least eight characters for the password.');
    validateBirthDate(dob);
    const credential = await storeDemoPassword(password);
    if (this.demoSession() !== session) throw new Error('Your session changed. Sign in and try again.');
    const state = this.store.state();
    if (normalized === session.email || state.doctors.some(doctor => doctor.email === normalized)) {
      throw new Error('An account already uses this email address.');
    }

    const doctor: DoctorAccount = {
      id: recordId('DR', state.doctors),
      name: name.trim(), email: normalized, specialty: specialty.trim(),
      phone: phone.trim(), license: license.trim(), dob, gender,
      active: true, createdAt: new Date().toISOString(),
    };
    this.store.replace({
      ...state,
      doctors: [doctor, ...state.doctors],
      doctorPasswords: { ...state.doctorPasswords, [doctor.id]: credential },
    });
    return doctor;
  }

  setDoctorActive(id: string, active: boolean): DoctorAccount {
    this.requireDemoRole('admin');
    const state = this.store.state();
    const current = state.doctors.find(doctor => doctor.id === id);
    if (!current) throw new Error('This doctor account could not be found.');

    const doctor = { ...current, active };
    this.store.replace({ ...state, doctors: state.doctors.map(entry => entry.id === id ? doctor : entry) });
    return doctor;
  }

  saveMedication(input: MedicationInput, id?: string): Medication {
    this.requireDemoRole('admin');
    const state = this.store.state();
    const name = input.name.trim();
    const strength = input.strength.trim();
    const form = input.form.trim();
    if (!name || !strength || !form) throw new Error('Enter the medication name, strength, and form.');
    if (id && !state.medications.some(medication => medication.id === id && !medication.archived)) {
      throw new Error('This medication is no longer available in the catalogue.');
    }
    const detailsKey = (entry: MedicationInput) => [entry.name, entry.strength, entry.form].join('|').toLowerCase();
    const medication: Medication = {
      id: id ?? recordId('MED', state.medications),
      name, strength, form,
      description: input.description.trim(),
      archived: false,
    };
    if (state.medications.some(entry => entry.id !== id && !entry.archived && detailsKey(entry) === detailsKey(medication))) {
      throw new Error('This name, strength, and form already exist in the catalogue.');
    }
    const medications = id
      ? state.medications.map(entry => entry.id === id ? medication : entry)
      : [medication, ...state.medications];
    this.store.replace({ ...state, medications });
    return medication;
  }

  removeMedication(id: string): 'deleted' | 'archived' {
    this.requireDemoRole('admin');
    const state = this.store.state();
    if (!state.medications.some(medication => medication.id === id && !medication.archived)) {
      throw new Error('This medication is no longer available in the catalogue.');
    }

    const inUse = state.prescriptions.some(prescription => prescription.items.some(item => item.medicationId === id))
      || state.doses.some(dose => dose.medicationId === id);
    const medications = inUse
      ? state.medications.map(medication => medication.id === id ? { ...medication, archived: true } : medication)
      : state.medications.filter(medication => medication.id !== id);
    this.store.replace({ ...state, medications });
    return inUse ? 'archived' : 'deleted';
  }

  resetDemo(): void {
    if (this.auth.mode() !== 'demo') throw new Error('Demo data is unavailable in live mode.');
    this.store.reset();
    this.auth.signOut();
  }

  private requireDemoRole(role: Role) {
    const session = this.demoSession();
    if (session?.role !== role) throw new Error('Your current session cannot perform this action.');
    return session;
  }
}
