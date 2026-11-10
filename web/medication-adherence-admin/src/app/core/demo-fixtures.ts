import { DoctorAccount, Dose, Medication, Patient, Prescription } from './models';
import { dateDaysAgo, localDateKey } from './report';
import { DemoPassword } from './demo-password';

export interface DemoState {
  doctors: DoctorAccount[];
  patients: Patient[];
  medications: Medication[];
  prescriptions: Prescription[];
  doses: Dose[];
  doctorPasswords?: Record<string, DemoPassword>;
}

export const DEMO_DATA_KEY = 'medminder.demo.data.v1';
export const DEMO_SESSION_KEY = 'medminder.demo.session.v1';
export const DEMO_PASSWORD = 'MedMinderDemo!';
export const DEMO_DOCTOR_EMAIL = 'doctor@medminder.demo';
export const DEMO_ADMIN_EMAIL = 'admin@medminder.demo';
export const DEMO_DOCTOR_ID = 'DR-1001';

export function seedDemo(): DemoState {
  const iso = (days: number) => dateDaysAgo(days).toISOString();
  const doctors: DoctorAccount[] = [
    { id: DEMO_DOCTOR_ID, name: 'Dr. Sarah Mitchell', email: DEMO_DOCTOR_EMAIL, specialty: 'Family Medicine', phone: '+1 202 555 0101', license: 'MD-12485', dob: '1982-04-16', gender: 'Female', active: true, createdAt: iso(210) },
    { id: 'DR-1002', name: 'Dr. James Carter', email: 'james.carter@medminder.demo', specialty: 'Internal Medicine', phone: '+1 202 555 0102', license: 'MD-28419', dob: '1978-02-28', gender: 'Male', active: true, createdAt: iso(171) },
    { id: 'DR-1003', name: 'Dr. Maya Patel', email: 'maya.patel@medminder.demo', specialty: 'Cardiology', phone: '+1 202 555 0103', license: 'MD-31259', dob: '1986-06-03', gender: 'Female', active: true, createdAt: iso(64) },
    { id: 'DR-1004', name: 'Dr. Daniel Brooks', email: 'daniel.brooks@medminder.demo', specialty: 'General Practice', phone: '+1 202 555 0104', license: 'MD-42816', dob: '1975-12-10', gender: 'Male', active: false, createdAt: iso(43) },
  ];

  const people = [
    ['Olivia Bennett', '1973-09-18', 'Female', 'Prefers a check-in in the afternoon.'],
    ['Marcus Reed', '1961-03-12', 'Male', 'Ask about missed doses at the next visit.'],
    ['Sofia Ramirez', '1990-08-30', 'Female', 'Confirmed the patient app is set up.'],
    ['Henry Walker', '1957-02-08', 'Male', 'Review dose history before the next appointment.'],
    ['Amelia Chen', '1984-07-16', 'Female', ''],
    ['Ethan Davis', '1989-04-21', 'Male', 'Recently registered.'],
    ['Nora Williams', '1975-04-03', 'Female', ''],
    ['Leo Thompson', '1964-05-17', 'Male', ''],
  ];
  const patients: Patient[] = people.map(([name, dob, gender, notes], index) => ({
    id: `PT-${1001 + index}`,
    name, dob, gender, notes,
    email: `${name.toLowerCase().replace(' ', '.')}@example.test`,
    phone: `+1 202 555 01${20 + index}`,
    doctorId: doctors[index < 6 ? 0 : 1].id,
    accessCode: `MM-${534217 + index * 83}`,
    createdAt: iso(index === 5 ? 2 : 49 - index * 3),
  }));

  const medications: Medication[] = [
    { id: 'MED-01', name: 'Metformin', strength: '500 mg', form: 'Tablet', description: 'Oral tablet', archived: false },
    { id: 'MED-02', name: 'Lisinopril', strength: '10 mg', form: 'Tablet', description: 'Oral tablet', archived: false },
    { id: 'MED-03', name: 'Atorvastatin', strength: '20 mg', form: 'Tablet', description: 'Oral tablet', archived: false },
    { id: 'MED-04', name: 'Amlodipine', strength: '5 mg', form: 'Tablet', description: 'Oral tablet', archived: false },
    { id: 'MED-05', name: 'Omeprazole', strength: '20 mg', form: 'Capsule', description: 'Delayed-release capsule', archived: false },
    { id: 'MED-06', name: 'Vitamin D3', strength: '1,000 IU', form: 'Capsule', description: 'Oral capsule', archived: false },
    { id: 'MED-07', name: 'Cetirizine', strength: '10 mg', form: 'Tablet', description: 'Oral tablet', archived: false },
    { id: 'MED-08', name: 'Salbutamol', strength: '100 mcg', form: 'Inhaler', description: 'Metered-dose inhaler', archived: false },
  ];
  const prescriptions: Prescription[] = patients.flatMap((patient, index) => {
    if (index === 5 || index === 7) return [];
    const first = medications[index % 5];
    const second = medications[(index + 1) % 5];
    const id = `RX-${1024 + index}`;
    return [{
      id,
      patientId: patient.id,
      doctorId: patient.doctorId,
      issuedAt: iso(35 - index),
      notes: '',
      status: 'Active',
      items: [first, second].map((medication, itemIndex) => ({
        id: `${id}-${itemIndex + 1}`,
        medicationId: medication.id,
        medicationName: medication.name,
        dose: medication.strength,
        frequency: itemIndex ? 'Once daily' : 'Twice daily',
        duration: 60,
        source: index === 2 && itemIndex === 1
          ? 'Patient-added'
          : index === 3 && itemIndex === 1
            ? 'Substituted'
            : 'Doctor-prescribed',
      })),
    }];
  });
  const targets = [96, 58, 87, 67, 92, 0, 82, 0];
  const doses: Dose[] = prescriptions.flatMap(prescription => {
    const patientIndex = patients.findIndex(patient => patient.id === prescription.patientId);
    return Array.from({ length: 27 }, (_, offset) =>
      prescription.items.flatMap((item, itemIndex) =>
        Array.from({ length: itemIndex === 0 ? 2 : 1 }, (_, occurrence) => {
          const score = (offset * 53 + patientIndex * 17 + itemIndex * 31 + occurrence * 37) % 100;
          const target = targets[patientIndex];
          return {
            id: `${item.id}-${offset}-${occurrence}`,
            patientId: prescription.patientId,
            medicationId: item.medicationId,
            medicationName: item.medicationName,
            date: localDateKey(dateDaysAgo(offset)),
            status: score < target ? 'Taken' : score < target + 8 ? 'Skipped' : 'Missed',
          } satisfies Dose;
        }),
      ),
    ).flat();
  });

  return { doctors, patients, medications, prescriptions, doses };
}
