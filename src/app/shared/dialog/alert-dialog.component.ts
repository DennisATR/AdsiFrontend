import { Component, Input, Output, EventEmitter, HostListener, OnInit } from '@angular/core';

export type AlertType = 'info' | 'success' | 'error' | 'warning';

@Component({
  selector: 'app-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.css']
})
export class AlertDialogComponent implements OnInit {
  @Input() message: string = '';
  @Input() type: AlertType = 'info';
  @Input() isConfirm: boolean = false;
  @Input() cambio: number = 0;
  @Output() dialogResult = new EventEmitter<boolean>();

  visible = false;

  ngOnInit() {
    // Trigger animation on next frame
    requestAnimationFrame(() => { this.visible = true; });
  }

  get title(): string {
    if (this.isConfirm) return '¿Está seguro?';
    switch (this.type) {
      case 'success': return 'Operación exitosa';
      case 'error':   return 'Ha ocurrido un error';
      case 'warning': return 'Atención';
      default:        return 'Información';
    }
  }

  accept() { this.close(true); }
  dismiss() { this.close(false); }

  private close(result: boolean) {
    this.visible = false;
    setTimeout(() => this.dialogResult.emit(result), 200);
  }

  @HostListener('document:keydown.escape')
  onEscape() { this.dismiss(); }

  @HostListener('document:keydown.enter', ['$event'])
  onEnter(event: KeyboardEvent) {
    if (!this.visible) return;
    event.preventDefault();
    event.stopPropagation();
    this.accept();
  }
}
