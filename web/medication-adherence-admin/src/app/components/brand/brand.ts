import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'mm-brand',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './brand.html',
  styleUrl: './brand.css',
})
export class Brand {

  readonly caption = input<string>('');
}
