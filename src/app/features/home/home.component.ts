import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Section {
  icon: string;
  title: string;
  description: string;
  route: string;
  soon?: boolean;
  accent?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="home">

      <!-- Hero -->
      <section class="hero">
        <div class="hero-icon">🖥️</div>
        <h1 class="hero-title">NAS <span>Athena</span></h1>
        <p class="hero-sub">Il tuo server personale — file, media e altro, sempre a portata di mano.</p>
      </section>

      <!-- Cards -->
      <section class="cards">
        @for (s of sections; track s.route) {
          @if (!s.soon) {
            <a class="card" [routerLink]="s.route" [style.--accent]="s.accent ?? 'var(--color-primary)'">
              <div class="card-icon">{{ s.icon }}</div>
              <div class="card-body">
                <h2>{{ s.title }}</h2>
                <p>{{ s.description }}</p>
              </div>
              <span class="card-arrow">→</span>
            </a>
          } @else {
            <div class="card soon" [style.--accent]="s.accent ?? 'var(--color-primary)'">
              <div class="card-icon">{{ s.icon }}</div>
              <div class="card-body">
                <h2>{{ s.title }} <span class="badge">presto</span></h2>
                <p>{{ s.description }}</p>
              </div>
            </div>
          }
        }
      </section>

    </div>
  `,
  styles: [`
    .home {
      min-height: 100%;
      padding: 48px 24px 64px;
      max-width: 860px;
      margin: 0 auto;
    }

    /* ── Hero ─────────────────────────────────────────────── */
    .hero {
      text-align: center;
      margin-bottom: 56px;
    }
    .hero-icon {
      font-size: 56px;
      margin-bottom: 12px;
      filter: drop-shadow(0 0 24px rgba(255,107,0,0.35));
    }
    .hero-title {
      font-size: clamp(28px, 5vw, 42px);
      font-weight: 700;
      color: var(--color-text);
      margin: 0 0 12px;
      span { color: var(--color-primary); }
    }
    .hero-sub {
      font-size: 15px;
      color: var(--color-text-muted);
      max-width: 480px;
      margin: 0 auto;
      line-height: 1.6;
    }

    /* ── Cards ────────────────────────────────────────────── */
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 16px;
    }

    .card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 14px;
      text-decoration: none;
      color: var(--color-text);
      transition: border-color 0.2s, background 0.2s, transform 0.15s;
      cursor: pointer;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        left: 0; top: 0; bottom: 0;
        width: 3px;
        background: var(--accent);
        opacity: 0;
        transition: opacity 0.2s;
      }

      &:hover:not(.soon) {
        border-color: var(--accent);
        background: color-mix(in srgb, var(--accent) 6%, var(--color-surface));
        transform: translateY(-2px);
        &::before { opacity: 1; }
        .card-arrow { opacity: 1; transform: translateX(0); }
      }

      &.soon {
        opacity: 0.45;
        cursor: default;
      }
    }

    .card-icon {
      font-size: 32px;
      flex-shrink: 0;
      width: 48px;
      text-align: center;
    }

    .card-body {
      flex: 1;
      h2 {
        font-size: 15px;
        font-weight: 600;
        margin: 0 0 4px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      p {
        font-size: 12px;
        color: var(--color-text-muted);
        margin: 0;
        line-height: 1.5;
      }
    }

    .card-arrow {
      font-size: 18px;
      color: var(--accent);
      opacity: 0;
      transform: translateX(-4px);
      transition: opacity 0.2s, transform 0.2s;
      flex-shrink: 0;
    }

    .badge {
      font-size: 9px;
      background: rgba(255,107,0,0.2);
      color: var(--color-primary);
      padding: 2px 6px;
      border-radius: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 700;
    }
  `],
})
export class HomeComponent {
  sections: Section[] = [
    {
      icon: '🎬',
      title: 'Media',
      description: 'Foto e video sul NAS.',
      route: '/media',
      accent: '#e040fb',
    },
    // ── Aggiungi qui le sezioni future ──────────────────────────────────────
    {
      icon: '📁',
      title: 'File',
      description: 'Naviga, apri e modifica i tuoi file sul NAS.',
      route: '/files',
      accent: '#ff6b00',
    },
    {
      icon: '⚙️',
      title: 'Impostazioni',
      description: 'Utenti, connessioni e preferenze del NAS.',
      route: '/settings',
      accent: '#42a5f5',
      soon: true,
    },
  ];
}
