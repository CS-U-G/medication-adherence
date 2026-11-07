import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Brand } from './brand';
import { Icon } from './icon';

@Component({imports:[RouterLink,Brand,Icon],template:`
<main id="main" class="error-page">
  <mm-brand/>
  <section class="card card-pad">
    <span class="metric-icon"><mm-icon [name]="forbidden ? 'lock' : 'info'"/></span>
    <p class="eyebrow">{{forbidden ? '403 · Access restricted' : '404 · Page not found'}}</p>
    <h1>{{forbidden ? 'This workspace requires a different role.' : 'We couldn’t find this page.'}}</h1>
    <p>{{forbidden ? 'Return to your workspace or sign in with an account for this role.' : 'The address may be incorrect or the page may have moved.'}}</p>
    <div class="actions">@if(auth.session(); as session) {<a class="btn" [routerLink]="['/',session.role]">Return to workspace</a>}<a class="btn btn-outline" routerLink="/">Go to homepage</a>@if(forbidden){<a class="text-link" routerLink="/login">Staff sign in</a>}</div>
  </section>
</main>`,styles:`.error-page{display:grid;gap:24px;margin:45px auto;width:min(600px,calc(100% - 32px))}.error-page section{padding:32px}.eyebrow{margin-top:14px}.error-page h1{font-size:clamp(27px,5vw,40px);margin:10px 0}.error-page .actions{margin-top:20px}`})
export class ErrorPage {
  protected readonly auth = inject(AuthService);
  protected readonly forbidden = inject(ActivatedRoute).snapshot.data['forbidden'] === true;
}
