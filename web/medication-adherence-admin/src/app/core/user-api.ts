import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { staffId, StaffHttp } from './staff-http';

export interface UserProfile {
  userId: number;
  personId: number;
  doctorId: number | null;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  role: 'Admin' | 'Doctor';
  specialization: string | null;
  licenseNumber: string | null;
  isActive: boolean;
}

export interface UpdateDoctorRequest {
  fullName: string;
  phoneNumber: string | null;
  specialization: string;
  licenseNumber: string | null;
}

function isUserProfile(profile: UserProfile | null): profile is UserProfile {
  return !!profile &&
    Number.isInteger(profile.userId) && profile.userId > 0 &&
    Number.isInteger(profile.personId) && profile.personId > 0 &&
    (profile.doctorId === null || (Number.isInteger(profile.doctorId) && profile.doctorId > 0)) &&
    (profile.role === 'Admin' || profile.role === 'Doctor') &&
    typeof profile.fullName === 'string' && typeof profile.email === 'string' &&
    typeof profile.isActive === 'boolean' &&
    [profile.phoneNumber, profile.gender, profile.dateOfBirth, profile.specialization, profile.licenseNumber]
      .every(value => value === null || typeof value === 'string');
}

@Injectable({ providedIn: 'root' })
export class UserApi {
  private readonly http = inject(StaffHttp);

  async listDoctors(): Promise<UserProfile[]> {
    try {
      const doctors = await this.http.get<UserProfile[] | null>('/api/users/doctors');
      if (!Array.isArray(doctors) || !doctors.every(profile => isUserProfile(profile) && profile.role === 'Doctor')) {
        throw new Error('The server returned an unexpected doctor list.');
      }
      return doctors;
    } catch (error) {
      // The directory uses this response for an empty collection.
      if (error instanceof HttpErrorResponse && error.status === 404 && error.error?.messsage === 'No Any Doctors.') {
        return [];
      }
      throw error;
    }
  }

  async get(userId: number): Promise<UserProfile> {
    const profile = await this.http.get<UserProfile | null>(`/api/users/user/${staffId(userId)}`);
    if (!isUserProfile(profile) || profile.userId !== userId) {
      throw new Error('The server returned an unexpected user profile.');
    }
    return profile;
  }

  async updateDoctor(doctorId: number, request: UpdateDoctorRequest): Promise<void> {
    const result = await this.http.put<{ message: string } | null>(`/api/users/doctors/${staffId(doctorId)}`, request);
    if (!result?.message) throw new Error('The server did not confirm the doctor profile update.');
  }

  async setActive(userId: number, active: boolean): Promise<void> {
    const action = active ? 'unfreeze' : 'freeze';
    const updated = await this.http.post<boolean>(`/api/users/${action}/${staffId(userId)}`, null);
    if (updated !== true) throw new Error('The account status could not be changed.');
  }
}
