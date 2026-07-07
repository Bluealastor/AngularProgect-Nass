import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// Componente modale generico usato da DialogService.
// Supporta due modalità:
//   'confirm' → mostra Annulla + Conferma, emette true/false
//   'alert'   → mostra solo OK, emette true
@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overlay" (click)="onOverlay()">
      <div class="modal" (click)="$event.stopPropagation()">
        @if (title) {
          <h3 class="modal-title">{{ title }}</h3>
        }
        <p class="modal-msg">{{ message }}</p>
        <div class="modal-actions">
          @if (mode === 'confirm') {
            <button class="btn cancel" (click)="emit(false)">Annulla</button>
            <button class="btn confirm" (click)="emit(true)">Conferma</button>
          } @else {
            <button class="btn confirm" (click)="emit(true)">OK</button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fade-in 0.15s ease;
    }

    @keyframes fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    .modal {
      background: #1e1e1e;
      border: 1px solid #333;
      border-radius: 12px;
      padding: 24px 28px;
      min-width: 320px;
      max-width: 480px;
      width: 90vw;
      box-shadow: 0 24px 64px rgba(0,0,0,0.5);
      animation: slide-up 0.15s ease;
    }

    @keyframes slide-up {
      from { transform: translateY(12px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }

    .modal-title {
      font-size: 15px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 10px;
    }

    .modal-msg {
      font-size: 14px;
      color: rgba(255,255,255,0.75);
      line-height: 1.5;
      margin: 0 0 24px;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .btn {
      padding: 8px 20px;
      border-radius: 8px;
      border: none;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s;
      &:hover { opacity: 0.85; }
    }

    .cancel  { background: #2a2a2a; color: rgba(255,255,255,0.7); border: 1px solid #444; }
    .confirm { background: #ff6b00; color: #fff; }
  `],
})
export class DialogComponent {
  @Input() mode: 'confirm' | 'alert' = 'confirm';
  @Input() title  = '';
  @Input() message = '';
  @Output() result = new EventEmitter<boolean>();

  emit(value: boolean): void {
    this.result.emit(value);
  }

  // Clic sull'overlay: per 'alert' chiude, per 'confirm' non fa nulla
  // (evita chiusure accidentali su azioni distruttive)
  onOverlay(): void {
    if (this.mode === 'alert') this.result.emit(true);
  }
}
