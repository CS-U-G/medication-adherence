import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../../services';
import { Brand } from '../../../components/brand/brand';
import { Icon } from '../../../components/icon/icon';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [RouterLink, Brand, Icon],
  templateUrl: './error-page.html',
  styleUrl: './error-page.css',
})
export class ErrorPage {
  protected readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  protected readonly forbidden = this.route.snapshot.data['forbidden'] === true;
}
