import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Session } from '../core/models';
import { Brand } from '../shared/brand';
import { Icon } from '../shared/icon';

@Component({imports:[ReactiveFormsModule,RouterLink,Brand,Icon],templateUrl:'./login.html',styleUrl:'./login.scss'})
export class Login {
  protected readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly visible = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly expired = this.route.snapshot.queryParamMap.has('expired');
  protected readonly form = inject(FormBuilder).nonNullable.group({email:['',[Validators.required,Validators.email]],password:['',Validators.required]});

  constructor() {
    const session = this.auth.session();
    if (session && !this.auth.expireIfNeeded()) {
      void this.router.navigateByUrl(`/${session.role}`, { replaceUrl: true });
    }
  }

  protected async submit() {
    this.error.set('');
    this.form.markAllAsTouched();
    if (this.form.invalid || this.busy()) return;
    this.busy.set(true);
    try {
      const {email,password} = this.form.getRawValue();
      await this.continue(await this.auth.signIn(email,password));
    } catch(error) {
      this.error.set(error instanceof Error ? error.message : 'Sign-in failed. Please try again.');
    } finally { this.busy.set(false); }
  }
  protected previewDoctor() {
    this.error.set('');
    try { void this.router.navigateByUrl(`/${this.auth.enterDemo().role}`); }
    catch(error) { this.error.set(error instanceof Error ? error.message : 'Could not open the doctor preview.'); }
  }
  private continue(session:Session) {
    const intended = this.route.snapshot.queryParamMap.get('returnUrl');
    const prefix = '/' + session.role;
    return this.router.navigateByUrl(intended && (intended === prefix || intended.startsWith(prefix+'/')) ? intended : prefix);
  }
}
