import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';

export type FileType = 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'OTHER' | 'DIRECTORY';

export interface FileItem {
  fileName: string;
  fullPath: string;
  size: number;
  lastModified: string;
  fileType: FileType;
  metadata?: Record<string, string>;
}

// Comunica con il file-service tramite api-gateway.
// Il JWT viene aggiunto automaticamente dall'AuthInterceptor.
@Injectable({ providedIn: 'root' })
export class FileService {
  private http   = inject(HttpClient);
  private tokens = inject(TokenService);

  private readonly base = `${environment.apiUrl}/api/files`;

  // Lista il contenuto di una directory locale del NAS
  list(path: string): Observable<FileItem[]> {
    const params = new HttpParams().set('path', path);
    return this.http.get<FileItem[]>(`${this.base}/local`, { params });
  }

  // URL diretto per streaming/preview (include ?token= per autenticazione browser)
  previewUrl(path: string): string {
    const token = this.tokens.getAccessToken();
    const base  = `${this.base}/preview?path=${encodeURIComponent(path)}`;
    return token ? `${base}&token=${token}` : base;
  }

  // URL per il download diretto
  downloadUrl(path: string): string {
    const token = this.tokens.getAccessToken();
    const base  = `${this.base}/download?path=${encodeURIComponent(path)}`;
    return token ? `${base}&token=${token}` : base;
  }

  // Legge il contenuto testuale di un file (per Monaco Editor)
  getContent(path: string): Observable<{ content: string }> {
    const params = new HttpParams().set('path', path);
    return this.http.get<{ content: string }>(`${this.base}/content`, { params });
  }

  // Salva il contenuto testuale di un file (per Monaco Editor)
  saveContent(path: string, content: string): Observable<void> {
    const params = new HttpParams().set('path', path);
    return this.http.put<void>(`${this.base}/content`, { content }, { params });
  }

  // Carica un singolo file nella cartella corrente del NAS.
  // 'folder' è il percorso relativo della cartella di destinazione (es. "media/INSTA360X5").
  // reportProgress + observe:'events' permette di tracciare la percentuale di avanzamento.
  uploadFile(file: File, folder: string): Observable<HttpEvent<string>> {
    const form = new FormData();
    form.append('file', file, file.name);
    if (folder) form.append('folder', folder);
    return this.http.post<string>(`${this.base}/upload`, form, {
      reportProgress: true,
      observe: 'events',
    });
  }
}
