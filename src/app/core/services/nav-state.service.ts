import { Injectable } from '@angular/core';

// Ricorda l'ultima cartella aperta nel file browser in modo che
// quando si torna indietro dal player, si riapre la stessa cartella.
@Injectable({ providedIn: 'root' })
export class NavStateService {
  lastFolderPath = '';
}
