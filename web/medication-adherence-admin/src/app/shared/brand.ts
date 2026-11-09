import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({selector:'mm-brand', imports:[RouterLink],template:`<a class="brand" routerLink="/" aria-label="MedMinder home"><span class="brand-mark"><img src="/assets/brand/medminder-logo.png" alt="" width="34" height="34"></span><span>Med<span>Minder</span>@if (caption()) {<small>{{ caption() }}</small>}</span></a>`})
export class Brand { readonly caption = input(''); }
