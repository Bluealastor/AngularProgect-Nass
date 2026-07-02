import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'files',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/file-browser/file-browser.component').then(
        m => m.FileBrowserComponent
      ),
  },
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
  { path: '', redirectTo: 'files', pathMatch: 'full' },
  { path: '**', redirectTo: 'files' },
];
