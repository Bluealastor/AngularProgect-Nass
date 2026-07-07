import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FileService, FileItem } from '../../core/services/file.service';
import { AuthService } from '../../core/services/auth.service';
import { NavStateService } from '../../core/services/nav-state.service';

const EXT_360  = ['insv', 'lrv'];
const EXT_TEXT = [
  'txt', 'md', 'markdown', 'log',
  'json', 'yaml', 'yml', 'xml', 'toml', 'ini', 'env', 'properties',
  'ts', 'js', 'mjs', 'html', 'htm', 'css', 'scss', 'less',
  'java', 'kt', 'py', 'go', 'rs', 'cpp', 'c', 'cs', 'php', 'rb',
  'swift', 'sh', 'bash', 'sql', 'graphql', 'dockerfile',
];

@Component({
  selector: 'app-file-browser',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-browser.component.html',
  styleUrls: ['./file-browser.component.scss'],
})
export class FileBrowserComponent implements OnInit {
  private fileSvc  = inject(FileService);
  private authSvc  = inject(AuthService);
  private router   = inject(Router);
  private route    = inject(ActivatedRoute);
  private navState = inject(NavStateService);

  section     = '';
  currentPath = '';
  items: FileItem[] = [];
  breadcrumbs: { label: string; path: string }[] = [];
  loading = false;
  error   = '';

  ngOnInit(): void {
    // Legge la sezione dalla route data (es. "media", "files")
    // e ripristina l'ultimo percorso visitato per quella sezione
    this.section = this.route.snapshot.data['section'] ?? '';
    this.loadPath(this.navState.getPath(this.section));
  }

  loadPath(path: string): void {
    this.loading = true;
    this.error   = '';
    this.fileSvc.list(path).subscribe({
      next: (items) => {
        this.items = items.sort((a, b) => {
          const aDir = a.fileType === 'DIRECTORY';
          const bDir = b.fileType === 'DIRECTORY';
          if (aDir !== bDir) return aDir ? -1 : 1;
          return a.fileName.localeCompare(b.fileName);
        });
        this.currentPath = path;
        this.navState.setPath(this.section, path);
        this.buildBreadcrumbs(path);
        this.loading = false;
      },
      error: () => {
        this.error   = 'Errore nel caricamento dei file.';
        this.loading = false;
      },
    });
  }

  private buildBreadcrumbs(path: string): void {
    const parts = path ? path.split('/') : [];
    this.breadcrumbs = [{ label: 'Home', path: this.section }];
    let cumulative = '';
    for (const part of parts) {
      cumulative = cumulative ? `${cumulative}/${part}` : part;
      this.breadcrumbs.push({ label: part, path: cumulative });
    }
  }

  navigate(item: FileItem): void {
    if (item.fileType === 'DIRECTORY') {
      this.loadPath(item.fullPath);
      return;
    }

    const ext = item.fileName.split('.').pop()?.toLowerCase() ?? '';

    if (EXT_360.includes(ext)) {
      this.router.navigate(['/video360'], {
        queryParams: { path: item.fullPath, name: item.fileName, section: this.section },
      });
    } else if (EXT_TEXT.includes(ext)) {
      this.router.navigate(['/editor'], {
        queryParams: { path: item.fullPath, name: item.fileName, section: this.section },
      });
    } else if (item.fileType === 'VIDEO') {
      this.router.navigate(['/video'], {
        queryParams: { path: item.fullPath, name: item.fileName, section: this.section },
      });
    } else if (item.fileType === 'IMAGE') {
      window.open(this.fileSvc.previewUrl(item.fullPath), '_blank');
    } else {
      window.open(this.fileSvc.downloadUrl(item.fullPath), '_blank');
    }
  }

  icon(item: FileItem): string {
    if (item.fileType === 'DIRECTORY') return '📁';
    const ext = item.fileName.split('.').pop()?.toLowerCase() ?? '';
    if (EXT_360.includes(ext))          return '🌐';
    if (EXT_TEXT.includes(ext))         return '📝';
    if (item.fileType === 'VIDEO')      return '🎬';
    if (item.fileType === 'IMAGE')      return '🖼️';
    return '📄';
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '—';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + units[i];
  }

  logout(): void {
    this.authSvc.logout();
  }
}
