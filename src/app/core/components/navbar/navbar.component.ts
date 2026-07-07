import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  soon?: boolean;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <!-- Logo -->
      <a class="brand" routerLink="/home">
        <span class="brand-icon">🖥️</span>
        <span class="brand-name">NAS <strong>Athena</strong></span>
      </a>

      <!-- Navigazione -->
      <ul class="nav-links">
        @for (item of navItems; track item.route) {
          <li>
            @if (!item.soon) {
              <a class="nav-link"
                 [routerLink]="item.route"
                 routerLinkActive="active"
                 [routerLinkActiveOptions]="{ exact: item.route === '/home' }">
                <span class="nav-icon">{{ item.icon }}</span>
                <span class="nav-label">{{ item.label }}</span>
              </a>
            } @else {
              <span class="nav-link soon" [title]="item.label + ' — prossimamente'">
                <span class="nav-icon">{{ item.icon }}</span>
                <span class="nav-label">{{ item.label }}</span>
                <span class="badge">presto</span>
              </span>
            }
          </li>
        }
      </ul>

      <!-- Logout -->
      <button class="logout-btn" (click)="logout()" title="Esci">
        <span>↩</span>
        <span class="nav-label">Esci</span>
      </button>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 20px;
      height: 56px;
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      flex-shrink: 0;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    /* Logo */
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: var(--color-text);
      margin-right: 16px;
      white-space: nowrap;
    }
    .brand-icon { font-size: 20px; }
    .brand-name { font-size: 15px; letter-spacing: 0.3px; }
    .brand-name strong { color: var(--color-primary); }

    /* Link */
    .nav-links {
      display: flex;
      align-items: center;
      gap: 2px;
      list-style: none;
      flex: 1;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 13px;
      color: var(--color-text-muted);
      text-decoration: none;
      transition: background 0.15s, color 0.15s;
      cursor: pointer;
      white-space: nowrap;

      &:hover:not(.soon) {
        background: rgba(255,255,255,0.07);
        color: var(--color-text);
      }
      &.active {
        background: rgba(255,107,0,0.15);
        color: var(--color-primary);
      }
      &.soon {
        opacity: 0.4;
        cursor: default;
      }
    }

    .nav-icon { font-size: 15px; }
    .badge {
      font-size: 9px;
      background: rgba(255,107,0,0.25);
      color: var(--color-primary);
      padding: 1px 5px;
      border-radius: 10px;
      margin-left: 2px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Logout */
    .logout-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: none;
      border: 1px solid var(--color-border);
      color: var(--color-text-muted);
      padding: 5px 12px;
      border-radius: 8px;
      font-size: 13px;
      cursor: pointer;
      transition: color 0.15s, border-color 0.15s;
      white-space: nowrap;
      &:hover { color: var(--color-text); border-color: var(--color-text-muted); }
    }

    /* Mobile: nascondi label, mostra solo icone */
    @media (max-width: 600px) {
      .nav-label { display: none; }
      .badge { display: none; }
      .brand-name { display: none; }
      .nav-link { padding: 6px 10px; }
      .logout-btn { padding: 5px 10px; }
    }
  `],
})
export class NavbarComponent {
  private authSvc = inject(AuthService);

  navItems: NavItem[] = [
    { label: 'Home',         icon: '🏠', route: '/home' },
    { label: 'File',         icon: '📁', route: '/files' },
    { label: 'Media',        icon: '🎬', route: '/media', soon: true },
    { label: 'Impostazioni', icon: '⚙️', route: '/settings', soon: true },
  ];

  logout(): void { this.authSvc.logout(); }
}
