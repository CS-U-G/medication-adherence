import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { MedicationApi } from '../core/medication-api';
import { MedMinderData } from '../core/medminder-data.service';
import { PrescriptionInput } from '../core/models';
import { PatientApi } from '../core/patient-api';
import { PrescriptionApi, prescriptionFrequency } from '../core/prescription-api';
import { staffId } from '../core/staff-http';
import { Icon } from '../shared/icon';

interface PatientOption {
  id: string;
  name: string;
}

interface MedicationOption extends PatientOption {
  strength: string | null;
  form: string | null;
}

@Component({
  selector: 'mm-prescription-builder',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './prescription-builder.html',
})
export class PrescriptionBuilderPage {
  private readonly auth = inject(AuthService);
  private readonly live = this.auth.mode() === 'live';
  private readonly demo = this.live ? null : inject(MedMinderData);
  private readonly api = this.live ? {
    patients: inject(PatientApi),
    medications: inject(MedicationApi),
    prescriptions: inject(PrescriptionApi),
  } : null;
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly livePatients = signal<PatientOption[]>([]);
  private readonly liveMedications = signal<MedicationOption[]>([]);
  protected readonly loading = signal(this.live);
  protected readonly loadError = signal('');
  protected readonly issuing = signal(false);
  protected readonly error = signal('');
  protected readonly review = signal<PrescriptionInput | null>(null);
  // The API adds the duration to today's UTC date using .NET DateOnly.
  protected readonly maximumDuration = this.live ? Math.floor((Date.UTC(9999, 11, 31) - Date.now()) / 86_400_000) : null;
  protected readonly patients = computed(() => this.demo?.patients() ?? this.livePatients());
  protected readonly medications = computed(() => {
    const medications = this.demo?.medications().filter(medication => !medication.archived) ?? this.liveMedications();
    return [...medications].sort((a, b) => a.name.localeCompare(b.name));
  });
  protected readonly frequencies = this.live
    ? Array.from({ length: 12 }, (_, index) => ({
      value: String(index + 1),
      label: prescriptionFrequency(index + 1),
    }))
    : ['Once daily', 'Twice daily', 'Three times daily', 'Every other day', 'Once weekly']
      .map(label => ({ label, value: label }));
  protected readonly form = this.fb.group({
    patientId: [this.initialPatient(), Validators.required],
    notes: ['', Validators.maxLength(500)],
    items: this.fb.array([this.medicationItem()]),
  });
  protected readonly items = this.form.controls.items;

  constructor() {
    if (this.live) void this.loadOptions();
  }

  protected async loadOptions(): Promise<void> {
    if (!this.api) return;
    this.loading.set(true);
    this.loadError.set('');
    try {
      const doctorId = staffId(this.auth.session()?.id);
      const [patients, medications] = await Promise.all([
        this.api.patients.listByDoctor(doctorId),
        this.api.medications.active(),
      ]);
      this.livePatients.set(patients.map(patient => ({ id: String(patient.patientId), name: patient.fullName })));
      this.liveMedications.set(medications.map(medication => ({
        id: String(medication.medicationId),
        name: medication.tradeName,
        strength: medication.strength,
        form: medication.dosageForm,
      })));
      this.form.controls.patientId.setValue(this.initialPatient());
    } catch (error) {
      this.loadError.set(error instanceof Error ? error.message : 'Patients and medications could not be loaded.');
    } finally {
      this.loading.set(false);
    }
  }

  private initialPatient(): string {
    const id = this.route.snapshot.queryParamMap.get('patient');
    return this.patients().find(patient => patient.id === id)?.id ?? '';
  }

  private medicationItem() {
    return this.fb.group({
      medicationId: ['', Validators.required],
      dose: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      frequency: ['', Validators.required],
      duration: new FormControl<number | null>(null, [
        Validators.required, Validators.min(1), Validators.pattern(/^\d+$/),
        ...(this.maximumDuration === null ? [] : [Validators.max(this.maximumDuration)]),
      ]),
    });
  }

  protected addItem(): void {
    this.items.push(this.medicationItem());
  }

  protected removeItem(index: number): void {
    if (this.items.length > 1) this.items.removeAt(index);
  }

  protected medicationLabel(medication: MedicationOption): string {
    return [medication.name, medication.strength, medication.form].filter(Boolean).join(' · ');
  }

  protected medicationName(id: string): string {
    const medication = this.medications().find(entry => entry.id === id);
    return medication ? this.medicationLabel(medication) : 'Medication';
  }

  protected patientName(id: string): string {
    return this.patients().find(patient => patient.id === id)?.name ?? 'Patient';
  }

  protected frequencyLabel(value: string): string {
    return this.frequencies.find(frequency => frequency.value === value)?.label ?? value;
  }

  protected openReview(dialog: HTMLDialogElement): void {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Check the highlighted prescription details.');
      return;
    }
    const draft = this.form.getRawValue();
    this.review.set({
      ...draft,
      items: draft.items.map(item => ({ ...item, dose: item.dose.trim(), duration: item.duration ?? 0 })),
    });
    dialog.showModal();
  }

  protected async issue(dialog: HTMLDialogElement): Promise<void> {
    const draft = this.review();
    if (!draft || this.issuing()) return;
    this.error.set('');
    this.issuing.set(true);
    try {
      const prescription = await this.submit(draft);
      if (this.destroyRef.destroyed) return;
      dialog.close();
      void this.router.navigate(['/doctor/patients', prescription.patientId], {
        queryParams: { issued: prescription.id },
      });
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'The prescription could not be issued.');
    } finally {
      this.issuing.set(false);
    }
  }

  private async submit(draft: PrescriptionInput): Promise<{ patientId: string | number; id: string | number }> {
    if (this.demo) return this.demo.issuePrescription(draft);
    if (!this.api) throw new Error('Prescriptions are unavailable in this session.');

    const patient = this.patients().find(entry => entry.id === draft.patientId);
    if (!patient) throw new Error('Choose a patient in your directory.');
    const prescription = await this.api.prescriptions.create({
      patientId: staffId(patient.id),
      doctorId: staffId(this.auth.session()?.id),
      diagnosisNotes: draft.notes.trim() || null,
      items: draft.items.map(item => {
        const medication = this.medications().find(entry => entry.id === item.medicationId);
        if (!medication) throw new Error('Choose a medication that is available in the catalogue.');
        return {
          medicationId: staffId(medication.id),
          prescribedMedName: medication.name,
          dosage: item.dose,
          frequencyPerDay: Number(item.frequency),
          durationDays: item.duration,
        };
      }),
    });
    return { patientId: prescription.patientId, id: prescription.prescriptionId };
  }
}
