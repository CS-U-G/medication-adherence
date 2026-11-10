import { PrescriptionItem } from '../core/models';

export function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('');
}

export function adherenceStatus(rate: number | null): { label: string; tone: string } {
  if (rate === null) return { label: 'No data', tone: '' };
  if (rate < 70) return { label: 'Needs follow-up', tone: 'badge-red' };
  if (rate < 85) return { label: 'Monitor', tone: 'badge-amber' };
  return { label: 'On track', tone: 'badge-green' };
}

export function medicationSourceTone(source: PrescriptionItem['source']): string {
  if (source === 'Doctor-prescribed') return 'badge-green';
  if (source === 'Substituted') return 'badge-amber';
  return '';
}
