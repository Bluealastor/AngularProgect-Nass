import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

// Le pagine "fullscreen" (video, editor) non usano il layout con navbar
// perché occupano tutto lo schermo e hanno la propria barra di controllo.
export const routes: Routes = [

  // ── Pagina di login (pubblica) ──────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then(m => m.LoginComponent),
  },

  // ── Layout autenticato (navbar + router-outlet) ─────────────────────────────
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/components/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./features/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'files',
        data: { section: 'files' },
        loadComponent: () =>
          import('./features/file-browser/file-browser.component').then(
            m => m.FileBrowserComponent
          ),
      },
      {
        path: 'media',
        data: { section: 'media' },
        loadComponent: () =>
          import('./features/file-browser/file-browser.component').then(
            m => m.FileBrowserComponent
          ),
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },

  // ── Pagine fullscreen (nessuna navbar) ──────────────────────────────────────
  {
    path: 'video',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/video-player/video-player.component').then(
        m => m.VideoPlayerComponent
      ),
  },
  {
    path: 'video360',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/video-360/video-360.component').then(
        m => m.Video360Component
      ),
  },
  {
    path: 'editor',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/text-editor/text-editor.component').then(
        m => m.TextEditorComponent
      ),
  },

  { path: '**', redirectTo: '' },
];
