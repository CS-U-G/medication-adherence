import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MedMinderData } from '../core/medminder-data.service';
import { PrescriptionInput } from '../core/models';
import { Icon } from '../shared/icon';

@Component({
  selector: 'mm-prescription-builder',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './prescription-builder.html',
})
export class PrescriptionBuilderPage {
  protected readonly data = inject(MedMinderData);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly error = signal('');
  protected readonly review = signal<PrescriptionInput | null>(null);
  protected readonly medications = computed(() => this.data.medications()
    .filter(medication => !medication.archived)
    .sort((a, b) => a.name.localeCompare(b.name)));
  protected readonly frequencies = ['Once daily', 'Twice daily', 'Three times daily', 'Every other day', 'Once weekly'];
  protected readonly form = this.fb.group({
    patientId: [this.initialPatient(), Validators.required],
    notes: ['', Validators.maxLength(500)],
    items: this.fb.array([this.medicationItem()]),
  });
  protected readonly items = this.form.controls.items;

  private initialPatient(): string {
    const id = this.route.snapshot.queryParamMap.get('patient');
    return this.data.patients().find(patient => patient.id === id)?.id ?? '';
  }

  private medicationItem() {
    return this.fb.group({
      medicationId: ['', Validators.required],
      dose: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      frequency: ['', Validators.required],
      duration: new FormControl<number | null>(null, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]),
    });
  }

  protected addItem(): void {
    this.items.push(this.medicationItem());
  }

  protected removeItem(index: number): void {
    if (this.items.length > 1) this.items.removeAt(index);
  }

  protected medicationLabel(id: string): string {
    const medication = this.medications().find(entry => entry.id === id);
    return medication ? [medication.name, medication.strength, medication.form].join(' · ') : 'Medication';
  }

  protected patientName(id: string): string {
    return this.data.patients().find(patient => patient.id === id)?.name ?? 'Patient';
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

  protected issue(dialog: HTMLDialogElement): void {
    const draft = this.review();
    if (!draft) return;
    this.error.set('');
    try {
      const prescription = this.data.issuePrescription(draft);
      dialog.close();
      void this.router.navigate(['/doctor/patients', prescription.patientId], {
        queryParams: { issued: prescription.id },
      });
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'The prescription could not be issued.');
    }
  }
}
