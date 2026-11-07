import { Component, input } from '@angular/core';

const icons: Record<string, string[]> = {
  'arrow-left':['M19 12H5m6 6-6-6 6-6'],
  search:['M21 21l-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z'],
  edit:['m16 3 5 5M4 20l4.8-1L21 6.8 17.2 3 5 15.2Z'],
  trash:['M3 6h18M9 6V3h6v3m4 0-1 15H6L5 6m5 4v7m4-7v7'],
  activity:['M3 12h4l3-7 4 14 3-7h4'], arrow:['M5 12h14m-6-6 6 6-6 6'], 'arrow-up':['M7 17 17 7M7 7h10v10'],
  chevron:['m9 18 6-6-6-6'], down:['m6 9 6 6 6-6'], plus:['M12 5v14M5 12h14'],
  check:['m5 12 4 4L19 6'], close:['m6 6 12 12M18 6 6 18'],
  grid:['M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z'],
  users:['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm4-3.87a4 4 0 0 1 0 7.75'],
  pill:['m9 15 6-6m-9 1 4-4a5.657 5.657 0 0 1 8 8l-4 4a5.657 5.657 0 0 1-8-8Zm2-2 8 8'],
  file:['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Zm0 0v6h6M8 13h8m-8 4h6'],
  chart:['M3 3v18h18M8 16v-4m5 4V8m5 8V5'],
  settings:['M12 8v8m-7-4h14','M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z'],
  lock:['M7 11V7a5 5 0 0 1 10 0v4M5 11h14v10H5z'],
  logout:['M10 17l5-5-5-5m5 5H3m10-9h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6'],
  menu:['M4 6h16M4 12h16M4 18h16'],
  phone:['M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm4 16h.01'],
  alert:['M12 9v4m0 4h.01M10.3 4.6 2.4 18.3A1.8 1.8 0 0 0 4 21h16a1.8 1.8 0 0 0 1.6-2.7L13.7 4.6a2 2 0 0 0-3.4 0Z'],
  calendar:['M3 6h18v15H3zM7 3v6m10-6v6M3 11h18'],
  eye:['M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'],
  'eye-off':['m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9 6.5a11 11 0 0 1 3-.5c6.4 0 10 6 10 6a15 15 0 0 1-3 3.4M6 8C3.4 10 2 12 2 12s3.6 6 10 6a11 11 0 0 0 4-.8'],
  shield:['M12 22s7-3 7-10V5l-7-3-7 3v7c0 7 7 10 7 10Zm-3-10 2 2 4-4'],
  stethoscope:['M6 3H4v5a5 5 0 0 0 10 0V3h-2m-3 10v2a5 5 0 0 0 10 0v-2m2-2a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z'],
  minus:['M5 12h14'], info:['M12 11v5m0-8h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z']
};
@Component({selector:'mm-icon',template:`<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">@for (path of paths(); track path) {<path [attr.d]="path"/>}</svg>`,styles:`:host{display:inline-flex;flex:none;width:1.1em;height:1.1em;vertical-align:middle}svg{width:100%;height:100%}`})
export class Icon {
  readonly name = input.required<string>();
  protected paths() { return icons[this.name()] ?? []; }
}
