import { Component } from '@angular/core';
import { DialogService } from './servicios/dialog.service';
import { AlertType } from './shared/dialog/alert-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'AdsiFrontend';

  constructor(private dialogService: DialogService) {
    this.overrideNativeAlert();
  }

  private overrideNativeAlert() {
    window.alert = (message: any) => {
      if (message === undefined || message === null) return;

      const msgStr = String(message);
      const lowerMsg = msgStr.toLowerCase();
      let type: AlertType = 'info';

      if (
        lowerMsg.includes('error') ||
        lowerMsg.includes('falló') ||
        lowerMsg.includes('no se pudo') ||
        lowerMsg.includes('incorrecto')
      ) {
        type = 'error';
      } else if (
        lowerMsg.includes('exito') ||
        lowerMsg.includes('éxito') ||
        lowerMsg.includes('guardado') ||
        lowerMsg.includes('correcto') ||
        lowerMsg.includes('exitosamente') ||
        lowerMsg.includes('creado') ||
        lowerMsg.includes('registrado')
      ) {
        type = 'success';
      } else if (
        lowerMsg.includes('advertencia') ||
        lowerMsg.includes('atención') ||
        lowerMsg.includes('obligatorio')
      ) {
        type = 'warning';
      }

      this.dialogService.mostrar(msgStr, type);
    };
  }
}