import { DoctorAccount } from '../core/models';
import { UserProfile } from '../core/user-api';

export interface LiveDoctorAccount extends Omit<DoctorAccount, 'id'> {
  id: number;
  doctorId: number | null;
}

export function doctorAccount(profile: UserProfile): LiveDoctorAccount {
  return {
    id: profile.userId,
    doctorId: profile.doctorId,
    name: profile.fullName,
    email: profile.email,
    specialty: profile.specialization ?? '',
    phone: profile.phoneNumber ?? '',
    license: profile.licenseNumber ?? '',
    dob: profile.dateOfBirth ?? '',
    gender: profile.gender === 'F' ? 'Female' : profile.gender === 'M' ? 'Male' : profile.gender ?? '',
    active: profile.isActive,
    createdAt: '',
  };
}

export function doctorInitials(name: string): string {
  return name.replace(/^Dr\.?\s+/i, '').trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('');
}
