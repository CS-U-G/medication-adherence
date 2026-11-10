import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MedMinderData } from '../core/medminder-data.service';
import { Medication } from '../core/models';
import { Icon } from '../shared/icon';

@Component({
  selector: 'mm-medication-catalogue',
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './medication-catalogue.html',
  styleUrl: './management.scss',
})
export class MedicationCataloguePage {
  private readonly data = inject(MedMinderData);
  private readonly editor = viewChild.required<ElementRef<HTMLDialogElement>>('editor');
  private readonly confirmation = viewChild.required<ElementRef<HTMLDialogElement>>('confirmation');
  private readonly addMedication = viewChild.required<ElementRef<HTMLButtonElement>>('addMedication');

  protected readonly query = signal('');
  protected readonly editing = signal<Medication | null>(null);
  protected readonly removing = signal<Medication | null>(null);
  protected readonly feedback = signal('');
  protected readonly error = signal('');

  protected readonly catalogue = computed(() => this.data.medications().filter(medication => !medication.archived));
  protected readonly results = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.catalogue().filter(medication => [medication.name, medication.strength, medication.form, medication.description]
      .some(value => value.toLowerCase().includes(query)));
  });
  protected readonly removalPreservesHistory = computed(() => {
    const target = this.removing();
    return target !== null && (
      this.data.prescriptions().some(prescription => prescription.items.some(item => item.medicationId === target.id))
      || this.data.doses().some(dose => dose.medicationId === target.id)
    );
  });

  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(120)]],
    strength: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(60)]],
    form: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(60)]],
    description: ['', Validators.maxLength(500)],
  });

  protected invalid(field: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[field];
    return control.touched && control.invalid;
  }

  protected openEditor(medication: Medication | null = null): void {
    this.editing.set(medication);
    this.form.reset(medication ?? undefined);
    this.error.set('');
    this.editor().nativeElement.showModal();
  }

  protected save(): void {
    this.form.markAllAsTouched();
    this.error.set('');
    if (this.form.invalid) return;

    try {
      const previous = this.editing();
      const saved = this.data.saveMedication(this.form.getRawValue(), previous?.id);
      this.feedback.set(previous ? `${saved.name} updated.` : `${saved.name} added to the catalogue.`);
      this.query.set('');
      this.editor().nativeElement.close();
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'The medication could not be saved.');
    }
  }

  protected openRemoval(medication: Medication): void {
    this.removing.set(medication);
    this.error.set('');
    this.confirmation().nativeElement.showModal();
  }

  protected remove(): void {
    const medication = this.removing();
    if (!medication) return;

    try {
      const outcome = this.data.removeMedication(medication.id);
      this.feedback.set(outcome === 'archived'
        ? `${medication.name} was archived. Existing prescriptions and dose history are preserved.`
        : `${medication.name} was removed from the catalogue.`);
      this.confirmation().nativeElement.close();
      this.addMedication().nativeElement.focus();
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'The medication could not be removed.');
    }
  }
}
