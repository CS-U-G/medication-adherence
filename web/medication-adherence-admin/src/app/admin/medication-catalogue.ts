import { DatePipe } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MEDMINDER_CONFIG } from '../core/app-mode';
import { MedicationApi, MedicationRecord, MedicationRequest } from '../core/medication-api';
import { MedMinderData } from '../core/medminder-data.service';
import { Medication } from '../core/models';
import { Icon } from '../shared/icon';

interface CatalogueEntry extends Omit<MedicationRecord, 'medicationId'> {
  id: number | string;
  description?: string;
}

function liveEntry({ medicationId, ...details }: MedicationRecord): CatalogueEntry {
  return { id: medicationId, ...details };
}

function demoEntry(medication: Medication): CatalogueEntry {
  return {
    id: medication.id,
    tradeName: medication.name,
    scientificName: null,
    dosageForm: medication.form,
    strength: medication.strength,
    description: medication.description,
    isActive: !medication.archived,
    createdAt: '',
  };
}

@Component({
  selector: 'mm-medication-catalogue',
  imports: [DatePipe, ReactiveFormsModule, Icon],
  templateUrl: './medication-catalogue.html',
  styleUrl: './management.scss',
})
export class MedicationCataloguePage {
  private readonly demo = inject(MEDMINDER_CONFIG).mode === 'demo' ? inject(MedMinderData) : null;
  private readonly api = inject(MedicationApi);
  private readonly editor = viewChild.required<ElementRef<HTMLDialogElement>>('editor');
  private readonly confirmation = viewChild.required<ElementRef<HTMLDialogElement>>('confirmation');
  private readonly addMedication = viewChild.required<ElementRef<HTMLButtonElement>>('addMedication');
  private readonly liveCatalogue = signal<CatalogueEntry[]>([]);

  protected readonly live = !this.demo;
  protected readonly loading = signal(this.live);
  protected readonly loadingDetail = signal(false);
  protected readonly loadError = signal('');
  protected readonly detailError = signal('');
  protected readonly saving = signal(false);
  protected readonly query = signal('');
  protected readonly editing = signal<CatalogueEntry | null>(null);
  protected readonly changing = signal<CatalogueEntry | null>(null);
  protected readonly feedback = signal('');
  protected readonly error = signal('');

  protected readonly catalogue = computed(() => this.demo
    ? this.demo.medications().filter(medication => !medication.archived).map(demoEntry)
    : this.liveCatalogue());
  protected readonly results = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.catalogue().filter(medication =>
      [medication.tradeName, medication.scientificName, medication.strength, medication.dosageForm, medication.description]
        .some(value => value?.toLowerCase().includes(query)),
    );
  });
  protected readonly removalPreservesHistory = computed(() => {
    const target = this.changing();
    return !!(this.demo && target && (
      this.demo.prescriptions().some(prescription => prescription.items.some(item => item.medicationId === target.id))
      || this.demo.doses().some(dose => dose.medicationId === target.id)
    ));
  });

  protected readonly dosageFormLimit = this.live ? 50 : 60;
  protected readonly strengthLimit = this.live ? 50 : 60;
  protected readonly form = inject(FormBuilder).nonNullable.group({
    tradeName: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(120)]],
    scientificName: ['', this.live ? [Validators.required, Validators.pattern(/\S/), Validators.maxLength(150)] : []],
    strength: ['', this.live ? [Validators.maxLength(this.strengthLimit)] :
      [Validators.required, Validators.pattern(/\S/), Validators.maxLength(this.strengthLimit)]],
    dosageForm: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(this.dosageFormLimit)]],
    description: ['', Validators.maxLength(500)],
  });

  ngOnInit(): void {
    if (this.live) void this.loadCatalogue();
  }

  protected async loadCatalogue(): Promise<void> {
    this.loading.set(true);
    this.loadError.set('');
    try {
      this.liveCatalogue.set((await this.api.list()).map(liveEntry));
    } catch {
      this.loadError.set('The medication catalogue could not be loaded.');
    } finally {
      this.loading.set(false);
    }
  }

  protected invalid(field: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[field];
    return control.touched && control.invalid;
  }

  protected async openEditor(medication: CatalogueEntry | null = null): Promise<void> {
    this.editing.set(medication);
    this.detailError.set('');
    this.error.set('');
    this.form.reset();
    this.editor().nativeElement.showModal();
    if (typeof medication?.id === 'number') {
      this.loadingDetail.set(true);
      try {
        medication = liveEntry(await this.api.get(medication.id));
        this.editing.set(medication);
        this.replaceEntry(medication);
      } catch {
        this.detailError.set('The medication details could not be loaded.');
        return;
      } finally {
        this.loadingDetail.set(false);
      }
    }

    if (medication) {
      this.form.reset({
        tradeName: medication.tradeName,
        scientificName: medication.scientificName ?? '',
        dosageForm: medication.dosageForm ?? '',
        strength: medication.strength ?? '',
        description: medication.description ?? '',
      });
    }
  }

  protected async save(): Promise<void> {
    if (this.saving() || this.loadingDetail() || this.detailError()) return;
    this.form.markAllAsTouched();
    this.error.set('');
    if (this.form.invalid) return;

    const previous = this.editing();
    const values = this.form.getRawValue();
    this.saving.set(true);
    try {
      let saved: CatalogueEntry;
      if (this.demo) {
        const { tradeName, dosageForm, strength, description } = values;
        saved = demoEntry(this.demo.saveMedication({ name: tradeName, form: dosageForm, strength, description },
          typeof previous?.id === 'string' ? previous.id : undefined));
      } else {
        const input: MedicationRequest = {
          tradeName: values.tradeName.trim(),
          scientificName: values.scientificName.trim(),
          dosageForm: values.dosageForm.trim(),
          strength: values.strength.trim() || null,
        };
        if (typeof previous?.id === 'number') {
          await this.api.update(previous.id, input);
          saved = { ...previous, ...input };
          this.replaceEntry(saved);
        } else {
          saved = liveEntry(await this.api.create(input));
          this.liveCatalogue.update(entries => [saved, ...entries]);
        }
      }
      this.feedback.set(previous ? `${saved.tradeName} updated.` : `${saved.tradeName} added to the catalogue.`);
      this.query.set('');
      this.editor().nativeElement.close();
    } catch (error) {
      this.error.set(this.demo && error instanceof Error ? error.message : 'The medication could not be saved.');
    } finally {
      this.saving.set(false);
    }
  }

  protected openConfirmation(medication: CatalogueEntry): void {
    this.changing.set(medication);
    this.error.set('');
    this.confirmation().nativeElement.showModal();
  }

  protected async changeAvailability(): Promise<void> {
    const medication = this.changing();
    if (!medication || this.saving()) return;

    this.saving.set(true);
    this.error.set('');
    try {
      if (typeof medication.id === 'number') {
        const isActive = !medication.isActive;
        await this.api.setActive(medication.id, isActive);
        this.replaceEntry({ ...medication, isActive });
        this.feedback.set(`${medication.tradeName} ${isActive ? 'activated' : 'deactivated'}.`);
      } else {
        const outcome = this.demo?.removeMedication(medication.id);
        this.feedback.set(outcome === 'archived'
          ? `${medication.tradeName} was archived. Existing prescriptions and dose history are preserved.`
          : `${medication.tradeName} was removed from the catalogue.`);
      }
      this.confirmation().nativeElement.close();
      this.addMedication().nativeElement.focus();
    } catch (error) {
      this.error.set(this.demo && error instanceof Error ? error.message : 'The medication status could not be changed.');
    } finally {
      this.saving.set(false);
    }
  }

  private replaceEntry(updated: CatalogueEntry): void {
    this.liveCatalogue.update(entries => entries.map(entry => entry.id === updated.id ? updated : entry));
  }
}
