import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../services';
import { Session } from '../../../services';
import { Brand } from '../../../components/brand/brand';
import { Icon } from '../../../components/icon/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, Brand, Icon],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  protected readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly visible = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly expired = this.route.snapshot.queryParamMap.has('expired');

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  constructor() {

    const session = this.auth.session();
    if (session && !this.auth.expireIfNeeded()) {
      void this.router.navigateByUrl(`/${session.role}`, { replaceUrl: true });
    }
  }

  protected async submit(): Promise<void> {
    this.error.set('');
    this.form.markAllAsTouched();

    if (this.form.invalid || this.busy()) {
      return;
    }

    this.busy.set(true);

    try {
      const { email, password } = this.form.getRawValue();
      const session = await this.auth.signIn(email, password);
      await this.continue(session);
    } catch (error) {
      if (error instanceof Error) {
        this.error.set(error.message);
      } else {
        this.error.set('Sign-in failed. Please try again.');
      }
    } finally {
      this.busy.set(false);
    }
  }

  protected previewDoctor(): void {
    this.error.set('');
    try {
      const session = this.auth.enterDemo();
      void this.router.navigateByUrl(`/${session.role}`);
    } catch (error) {
      if (error instanceof Error) {
        this.error.set(error.message);
      } else {
        this.error.set('Could not open the doctor preview.');
      }
    }
  }

  private continue(session: Session): Promise<boolean> {
    const intended = this.route.snapshot.queryParamMap.get('returnUrl');
    const prefix = '/' + session.role;

    if (intended && (intended === prefix || intended.startsWith(prefix + '/'))) {
      return this.router.navigateByUrl(intended);
    }

    return this.router.navigateByUrl(prefix);
  }
}
