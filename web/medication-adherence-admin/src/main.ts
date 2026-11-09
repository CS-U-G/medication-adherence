import { provideHttpClient } from '@angular/common/http';
import { Component, isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterOutlet, withInMemoryScrolling } from '@angular/router';
import { routes } from './app/app.routes';
import { MEDMINDER_CONFIG } from './app/core/app-mode';
import { loadConfig } from './app/core/runtime-config';

@Component({selector:'app-root',imports:[RouterOutlet],template:`<a class="btn skip-link" href="#main">Skip to content</a><router-outlet/>`})
class App {}

loadConfig(isDevMode()).then(config => bootstrapApplication(App,{
  providers:[{provide:MEDMINDER_CONFIG,useValue:config},provideHttpClient(),provideRouter(routes,withInMemoryScrolling({scrollPositionRestoration:'enabled',anchorScrolling:'enabled'}))]
})).catch(() => {
  // No fallback to demo or same-origin credentials when deployment configuration is invalid.
  const host = document.querySelector('app-root');
  if (!host) return;
  const main = document.createElement('main');
  main.id = 'main';
  main.className = 'startup-error card card-pad';
  const title = document.createElement('h1');
  title.textContent = 'MedMinder could not start';
  const detail = document.createElement('p');
  detail.textContent = 'Application configuration is unavailable or invalid. Reload to try again, or contact your administrator.';
  const retry = document.createElement('button');
  retry.className = 'btn';
  retry.textContent = 'Reload application';
  retry.onclick = () => location.reload();
  main.append(title, detail, retry);
  host.replaceChildren(main);
});
