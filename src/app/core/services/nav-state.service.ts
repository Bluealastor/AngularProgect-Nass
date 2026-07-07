import { Injectable } from '@angular/core';

// Ricorda l'ultima cartella aperta per ogni sezione (media, files, ecc.)
// così tornando indietro dal player si riapre la stessa cartella.
@Injectable({ providedIn: 'root' })
export class NavStateService {
  private paths: Record<string, string> = {};

  getPath(section: string): string {
    // Se non c'è un percorso salvato, usa il nome della sezione come cartella root
    return this.paths[section] ?? section;
  }

  setPath(section: string, path: string): void {
    this.paths[section] = path;
  }
}
