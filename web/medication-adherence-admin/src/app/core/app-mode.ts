import { InjectionToken } from '@angular/core';
import { AppMode } from './models';

export interface MedMinderConfig {
  mode: AppMode;
  apiBaseUrl: string;
}

// Keep the URL empty when the API is served on the same origin.
export const MEDMINDER_CONFIG = new InjectionToken<MedMinderConfig>('MedMinder configuration', {
  providedIn: 'root',
  factory: () => ({ mode: 'demo', apiBaseUrl: '' }),
});
