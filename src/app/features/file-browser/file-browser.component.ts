import { Component, inject, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpEventType } from '@angular/common/http';
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

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  section     = '';
  currentPath = '';
  items: FileItem[] = [];
  breadcrumbs: { label: string; path: string }[] = [];
  loading = false;
  error   = '';

  // Stato upload
  uploading   = false;
  uploadQueue: { name: string; progress: number; done: boolean; error: boolean }[] = [];

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

  deleteItem(item: FileItem, event: Event): void {
    event.stopPropagation(); // evita di aprire il file mentre si clicca elimina
    const tipo = item.fileType === 'DIRECTORY' ? 'cartella' : 'file';
    const msg  = item.fileType === 'DIRECTORY'
      ? `Eliminare la cartella "${item.fileName}" e tutto il suo contenuto?`
      : `Eliminare il file "${item.fileName}"?`;
    if (!confirm(msg)) return;

    this.fileSvc.delete(item.fullPath).subscribe({
      next: () => this.loadPath(this.currentPath),
      error: () => alert(`Errore durante l'eliminazione del ${tipo}.`),
    });
  }

  openFilePicker(): void {
    this.fileInputRef.nativeElement.value = '';
    this.fileInputRef.nativeElement.click();
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const files = Array.from(input.files);
    this.uploadQueue = files.map(f => ({ name: f.name, progress: 0, done: false, error: false }));
    this.uploading = true;
    this.uploadNext(files, 0);
  }

  private uploadNext(files: File[], index: number): void {
    if (index >= files.length) {
      // tutti completati — ricarica la cartella
      setTimeout(() => {
        this.uploading = false;
        this.uploadQueue = [];
        this.loadPath(this.currentPath);
      }, 1200);
      return;
    }

    const file = files[index];
    const entry = this.uploadQueue[index];

    this.fileSvc.uploadFile(file, this.currentPath).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          entry.progress = Math.round((event.loaded / event.total) * 100);
        } else if (event.type === HttpEventType.Response) {
          entry.progress = 100;
          entry.done = true;
          this.uploadNext(files, index + 1);
        }
      },
      error: () => {
        entry.error = true;
        this.uploadNext(files, index + 1);
      },
    });
  }

  logout(): void {
    this.authSvc.logout();
  }
}
