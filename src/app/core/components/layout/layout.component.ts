import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

// Shell autenticato: navbar globale + contenuto della route attiva.
// Tutte le pagine che richiedono login (home, files, ecc.) sono figlie di questo layout.
// Le pagine fullscreen (video player, editor, viewer 360°) usano le proprie route
// fuori da questo layout per non mostrare la navbar.
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <div class="shell">
      <app-navbar />
      <main class="content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .shell {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }
    .content {
      flex: 1;
      overflow-y: auto;
    }
  `],
})
export class LayoutComponent {}
