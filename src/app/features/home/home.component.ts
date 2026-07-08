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

interface Service {
  icon: string;
  title: string;
  description: string;
  port: number;
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

      <!-- Sezioni interne -->
      <h2 class="section-label">Sezioni</h2>
      <section class="cards">
        @for (s of sections; track s.route) {
          @if (!s.soon) {
            <a class="card" [routerLink]="s.route" [style.--accent]="s.accent ?? 'var(--color-primary)'">
              <div class="card-icon">{{ s.icon }}</div>
              <div class="card-body">
                <h3>{{ s.title }}</h3>
                <p>{{ s.description }}</p>
              </div>
              <span class="card-arrow">→</span>
            </a>
          } @else {
            <div class="card soon" [style.--accent]="s.accent ?? 'var(--color-primary)'">
              <div class="card-icon">{{ s.icon }}</div>
              <div class="card-body">
                <h3>{{ s.title }} <span class="badge">presto</span></h3>
                <p>{{ s.description }}</p>
              </div>
            </div>
          }
        }
      </section>

      <!-- Servizi esterni -->
      <h2 class="section-label">Servizi</h2>
      <section class="cards">
        @for (sv of services; track sv.port) {
          <a class="card" [href]="serviceUrl(sv.port)" target="_blank" rel="noopener"
             [style.--accent]="sv.accent ?? 'var(--color-primary)'">
            <div class="card-icon">{{ sv.icon }}</div>
            <div class="card-body">
              <h3>{{ sv.title }}</h3>
              <p>{{ sv.description }}</p>
            </div>
            <span class="card-arrow ext">↗</span>
          </a>
        }
      </section>

    </div>
  `,
  styles: [`
    .home {
      min-height: 100%;
      padding: 48px 24px 64px;
      max-width: 960px;
      margin: 0 auto;
    }

    /* ── Hero ─────────────────────────────────────────────── */
    .hero {
      text-align: center;
      margin-bottom: 48px;
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

    /* ── Label sezione ────────────────────────────────────── */
    .section-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--color-text-muted);
      margin: 0 0 12px;
    }

    /* ── Cards ────────────────────────────────────────────── */
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 14px;
      margin-bottom: 36px;
    }

    .card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 18px 20px;
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
      font-size: 30px;
      flex-shrink: 0;
      width: 44px;
      text-align: center;
    }

    .card-body {
      flex: 1;
      min-width: 0;
      h3 {
        font-size: 14px;
        font-weight: 600;
        margin: 0 0 3px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      p {
        font-size: 12px;
        color: var(--color-text-muted);
        margin: 0;
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .card-arrow {
      font-size: 16px;
      color: var(--accent);
      opacity: 0;
      transform: translateX(-4px);
      transition: opacity 0.2s, transform 0.2s;
      flex-shrink: 0;
      &.ext { transform: translate(-4px, 4px); }
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
    {
      icon: '📁',
      title: 'File',
      description: 'Naviga, apri e modifica i tuoi file.',
      route: '/files',
      accent: '#ff6b00',
    },
    {
      icon: '⚙️',
      title: 'Impostazioni',
      description: 'Utenti, connessioni e preferenze.',
      route: '/settings',
      accent: '#42a5f5',
      soon: true,
    },
  ];

  services: Service[] = [
    {
      icon: '🎞️',
      title: 'Jellyfin',
      description: 'Streaming film e serie TV.',
      port: 8096,
      accent: '#00a4dc',
    },
    {
      icon: '🎬',
      title: 'Radarr',
      description: 'Gestione e download automatico film.',
      port: 7878,
      accent: '#ffc230',
    },
    {
      icon: '📺',
      title: 'Sonarr',
      description: 'Gestione e download automatico serie.',
      port: 8989,
      accent: '#35c5f4',
    },
    {
      icon: '🔍',
      title: 'Prowlarr',
      description: 'Gestione centralizzata degli indexer.',
      port: 9696,
      accent: '#ff6b35',
    },
    {
      icon: '⬇️',
      title: 'qBittorrent',
      description: 'Client torrent.',
      port: 8090,
      accent: '#4caf50',
    },
    {
      icon: '🍿',
      title: 'Jellyseerr',
      description: 'Richiedi film e serie TV.',
      port: 5055,
      accent: '#e91e63',
    },
  ];

  // Costruisce l'URL del servizio usando l'hostname corrente
  // così funziona sia da LAN (192.168.1.177) che da Tailscale (athena)
  serviceUrl(port: number): string {
    return `${window.location.protocol}//${window.location.hostname}:${port}`;
  }
}
