import { InjectionToken } from '@angular/core';
import { AppMode } from './models';

export const MEDMINDER_API_ORIGIN = 'https://medication-adherence.onrender.com';

export interface MedMinderConfig {
  mode: AppMode;
}

export const MEDMINDER_CONFIG = new InjectionToken<MedMinderConfig>('MedMinder configuration', {
  providedIn: 'root',
  factory: () => ({ mode: 'live' }),
});
