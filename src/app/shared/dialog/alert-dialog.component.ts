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
  @Input() wifiUser: string = '';
  @Input() wifiPassword: string = '';
  @Output() dialogResult = new EventEmitter<boolean>();

  visible = false;
  copiedUser = false;
  copiedPassword = false;

  ngOnInit() {
    // Trigger animation on next frame
    requestAnimationFrame(() => { this.visible = true; });
  }

  copiarTexto(texto: string, tipo: 'user' | 'pass') {
    if (!texto) return;
    navigator.clipboard.writeText(texto).then(() => {
      if (tipo === 'user') {
        this.copiedUser = true;
        setTimeout(() => { this.copiedUser = false; }, 2000);
      } else {
        this.copiedPassword = true;
        setTimeout(() => { this.copiedPassword = false; }, 2000);
      }
    }).catch(err => {
      console.error('Error al copiar:', err);
    });
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
