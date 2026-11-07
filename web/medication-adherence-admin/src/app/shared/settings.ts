import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { MedMinderData } from '../core/medminder-data.service';
import { Icon } from './icon';

@Component({imports:[DatePipe,Icon],template:`
<header class="page-heading"><div><div class="eyebrow">Account</div><h1>Account settings</h1><p>Review your staff profile and manage your session.</p></div></header>
<div class="settings-grid">
  <section class="card card-pad"><div class="panel-heading"><div><h2>Staff profile</h2><p>Your MedMinder account details.</p></div><span class="metric-icon"><mm-icon name="users"/></span></div>
    <dl><dt>Name</dt><dd>{{auth.session()?.name}}</dd><dt>Email address</dt><dd>{{auth.session()?.email}}</dd><dt>Workspace</dt><dd>{{auth.session()?.role==='admin' ? 'Administrator' : 'Doctor'}}</dd></dl>
  </section>
  <section class="card card-pad"><div class="panel-heading"><div><h2>Current session</h2><p>Sign out when you finish working.</p></div><span class="metric-icon"><mm-icon name="lock"/></span></div>
    <dl><dt>Signed in</dt><dd>{{auth.session()?.signedInAt | date:'medium'}}</dd><dt>Mode</dt><dd>{{auth.mode()==='demo' ? 'Demo · Fictional data' : 'Staff access'}}</dd></dl>
    <button class="btn btn-outline" type="button" (click)="signOut()"><mm-icon name="logout"/> Sign out</button>
  </section>
  @if(auth.mode()==='demo') {
    <section class="card card-pad demo-reset">
      <div class="panel-heading"><div><h2>Reset demo data</h2><p>Restore the sample records and end this session. Changes made in both demos will be cleared in this browser.</p></div></div>
      <button class="btn btn-outline" type="button" (click)="resetDialog.showModal()">Reset demo data</button>
      @if(error()){<p class="notice error" role="alert">{{error()}}</p>}
    </section>
  }
</div>
<dialog #resetDialog aria-labelledby="reset-title"><h2 id="reset-title">Reset both demos?</h2><p>Sample data will be restored and you’ll return to the homepage.</p><div class="actions"><button type="button" class="btn btn-outline" autofocus (click)="resetDialog.close()">Cancel</button><button type="button" class="btn btn-danger" (click)="reset(resetDialog)">Reset demo data</button></div></dialog>
`,styles:`
.settings-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
dl{display:grid;grid-template-columns:minmax(0,120px) minmax(0,1fr);gap:9px 16px;padding:12px 0;margin:0 0 14px;border-block:1px solid var(--line)}
dt{color:var(--muted);font-size:13px}dd{margin:0;overflow-wrap:anywhere;font-weight:650}
.demo-reset{grid-column:1/-1}.demo-reset .notice{margin-top:12px}
@media(max-width:670px){.settings-grid{grid-template-columns:1fr}}
`})
export class Settings {
  protected readonly auth = inject(AuthService);
  private readonly data = inject(MedMinderData);
  private readonly router = inject(Router);
  protected readonly error = signal('');
  protected signOut() { this.auth.signOut(); void this.router.navigate(['/']); }
  protected reset(dialog: HTMLDialogElement) {
    try { this.data.resetDemo(); dialog.close(); this.signOut(); }
    catch(error) { dialog.close(); this.error.set(error instanceof Error ? error.message : 'Demo data could not be reset.'); }
  }
}
