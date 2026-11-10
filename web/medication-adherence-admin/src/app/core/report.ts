import { AdherenceCounts, AdherenceReport, Dose, ReportPeriod } from './models';

export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function dateDaysAgo(offset: number): Date {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - offset);
  return date;
}

const weekdayFormat = new Intl.DateTimeFormat('en', { weekday: 'short' });
const monthDayFormat = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' });

function summarize(records: readonly Dose[]): AdherenceCounts {
  let taken = 0;
  let skipped = 0;
  let missed = 0;

  for (const dose of records) {
    if (dose.status === 'Taken') taken++;
    if (dose.status === 'Skipped') skipped++;
    if (dose.status === 'Missed') missed++;
  }

  return {
    taken, skipped, missed, due: records.length,
    rate: records.length ? Math.round(taken * 100 / records.length) : null,
  };
}

export function buildReport(records: readonly Dose[], period: ReportPeriod): AdherenceReport {
  const dates = Array.from({ length: period }, (_, index) => dateDaysAgo(period - 1 - index));
  const keys = dates.map(localDateKey);
  const inPeriod = records.filter(dose => dose.date >= keys[0] && dose.date <= keys[keys.length - 1]);
  const byDay = new Map<string, Dose[]>();
  const byMedication = new Map<string, Dose[]>();

  for (const dose of inPeriod) {
    const day = byDay.get(dose.date) ?? [];
    day.push(dose);
    byDay.set(dose.date, day);

    const medication = byMedication.get(dose.medicationId) ?? [];
    medication.push(dose);
    byMedication.set(dose.medicationId, medication);
  }

  const formatter = period === 7 ? weekdayFormat : monthDayFormat;
  return {
    ...summarize(inPeriod),
    days: dates.map((date, index) => ({
      date: keys[index],
      label: formatter.format(date),
      ...summarize(byDay.get(keys[index]) ?? []),
    })),
    medications: [...byMedication.values()].map(doses => ({
      name: doses[0].medicationName,
      ...summarize(doses),
    })).sort((a, b) => a.name.localeCompare(b.name)),
  };
}
