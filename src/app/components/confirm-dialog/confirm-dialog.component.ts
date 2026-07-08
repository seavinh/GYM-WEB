import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    @if (show) {
      <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 300; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px);"
           (click)="onCancel()">
        <div style="background: var(--bg-card); border: 1px solid var(--border-light); border-radius: 20px; padding: 32px; width: 100%; max-width: 400px; text-align: center;"
             (click)="$event.stopPropagation()">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(248,113,113,0.12); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
            <i class="bi bi-exclamation-triangle" style="font-size: 1.5rem; color: var(--accent-red);"></i>
          </div>
          <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
            {{ title | translate }}
          </h4>
          <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 24px;">
            {{ message | translate }}
          </p>
          <div style="display: flex; gap: 10px;">
            <button class="btn-secondary" style="flex: 1; justify-content: center;" (click)="onCancel()">
              {{ 'common.cancel' | translate }}
            </button>
            <button class="btn-danger" style="flex: 1; justify-content: center;" (click)="onConfirm()">
              {{ 'common.delete' | translate }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmDialog {
  @Input() show = false;
  @Input() title = 'common.confirm';
  @Input() message = 'common.confirm_delete';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
