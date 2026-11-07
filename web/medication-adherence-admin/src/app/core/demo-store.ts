import { Injectable, signal } from '@angular/core';
import { DEMO_DATA_KEY, DemoState, seedDemo } from './demo-fixtures';

@Injectable({ providedIn: 'root' })
export class DemoStore {
  private readonly snapshot = signal(this.load());
  readonly state = this.snapshot.asReadonly();

  replace(state: DemoState): void {
    try {
      localStorage.setItem(DEMO_DATA_KEY, JSON.stringify(state));
    } catch {
      throw new Error('This browser could not save demo changes. Free some browser storage and try again.');
    }
    this.snapshot.set(state);
  }

  reset(): void {
    this.replace(seedDemo());
  }

  private load(): DemoState {
    try {
      const saved = localStorage.getItem(DEMO_DATA_KEY);
      if (saved) return JSON.parse(saved) as DemoState;
    } catch {
      // A clean workspace is available if stored demo data cannot be read.
    }

    const state = seedDemo();
    try {
      localStorage.setItem(DEMO_DATA_KEY, JSON.stringify(state));
    } catch {
      // The seeded demo remains available for viewing.
    }
    return state;
  }
}
