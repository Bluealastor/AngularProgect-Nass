import { Injectable, inject, ApplicationRef, createComponent, EnvironmentInjector } from '@angular/core';
import { DialogComponent } from '../components/dialog/dialog.component';

// Servizio per mostrare modal di conferma/avviso a livello globale,
// senza usare confirm() e alert() nativi del browser.
//
// Utilizzo:
//   const ok = await this.dialog.confirm('Eliminare il file?', 'Conferma');
//   await this.dialog.alert('File eliminato con successo.');
@Injectable({ providedIn: 'root' })
export class DialogService {
  private appRef  = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);

  // Mostra un dialog di conferma con Annulla / Conferma.
  // Ritorna una Promise<boolean>: true se l'utente ha confermato.
  confirm(message: string, title = 'Conferma'): Promise<boolean> {
    return this.open('confirm', message, title);
  }

  // Mostra un dialog informativo con solo il pulsante OK.
  // Ritorna una Promise<void> che si risolve quando l'utente clicca OK.
  alert(message: string, title = 'Avviso'): Promise<void> {
    return this.open('alert', message, title).then(() => undefined);
  }

  // Crea dinamicamente il DialogComponent, lo appende al DOM,
  // e lo distrugge quando l'utente risponde.
  private open(mode: 'confirm' | 'alert', message: string, title: string): Promise<boolean> {
    return new Promise(resolve => {
      const ref = createComponent(DialogComponent, {
        environmentInjector: this.injector,
      });

      ref.instance.mode    = mode;
      ref.instance.title   = title;
      ref.instance.message = message;

      ref.instance.result.subscribe((value: boolean) => {
        this.appRef.detachView(ref.hostView);
        ref.destroy();
        resolve(value);
      });

      this.appRef.attachView(ref.hostView);
      document.body.appendChild(ref.location.nativeElement);
    });
  }
}
