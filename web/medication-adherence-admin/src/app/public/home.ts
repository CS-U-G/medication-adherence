import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Brand } from '../shared/brand';
import { Chart } from '../shared/chart';
import { Icon } from '../shared/icon';

@Component({imports:[RouterLink,Brand,Chart,Icon],templateUrl:'./home.html',styleUrl:'./home.scss'})
export class Home {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly demoError = signal('');
  protected readonly preview = [73,80,80,80,80,87,80].map((rate,i) => ({label:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],rate}));
  protected readonly steps = [
    {icon:'file', title:'Prescribe', detail:'A doctor registers the patient, shares a mobile access code, and issues a prescription with dose, frequency, and duration.'},
    {icon:'phone', title:'Record', detail:'The patient chooses reminder times in the companion mobile app and records each dose as taken or skipped.'},
    {icon:'chart', title:'Follow up', detail:'The doctor reviews dose outcomes and adherence trends to decide who may need a conversation.'}
  ];
  protected demo(role:'doctor'|'admin') { this.demoError.set(''); try { this.auth.enterDemo(role); void this.router.navigate(['/',role]); } catch(error) { this.demoError.set(error instanceof Error ? error.message : 'Could not start the demo.'); } }
}
