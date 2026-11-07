import { provideHttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterOutlet, withInMemoryScrolling } from '@angular/router';
import { routes } from './app/app.routes';

@Component({selector:'app-root',imports:[RouterOutlet],template:`<a class="btn skip-link" href="#main">Skip to content</a><router-outlet/>`})
class App {}

bootstrapApplication(App,{
  providers:[provideHttpClient(),provideRouter(routes,withInMemoryScrolling({scrollPositionRestoration:'enabled',anchorScrolling:'enabled'}))]
}).catch(error => console.error(error));
