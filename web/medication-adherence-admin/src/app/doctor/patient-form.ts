import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { PatientInputDto } from '../core/patient-api';
import { localDateKey } from '../core/report';

export function patientFields(fb: NonNullableFormBuilder, today: string, live: boolean) {
  return {
    name: fb.control('', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]),
    phone: fb.control('', live ? [Validators.maxLength(20)] : [
      Validators.maxLength(25), Validators.pattern(/^\+?(?:[(). -]*\d){7,15}[(). -]*$/),
    ]),
    dob: fb.control('', [Validators.required, control => {
      const date = control.value as string;
      return date && (date > today || localDateKey(new Date(date + 'T12:00:00')) !== date)
        ? { birthDate: true }
        : null;
    }]),
    gender: fb.control('', live ? [Validators.required] : []),
    notes: fb.control('', [Validators.maxLength(500)]),
  };
}

export function patientInputDto(input: { name: string; phone: string; gender: string; dob: string; notes: string }): PatientInputDto {
  return {
    fullName: input.name.trim(),
    phoneNumber: input.phone.trim() || null,
    gender: input.gender,
    dateOfBirth: input.dob,
    medicalNotes: input.notes.trim() || null,
  };
}
