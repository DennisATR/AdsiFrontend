import { Injectable, ApplicationRef, createComponent, EnvironmentInjector } from '@angular/core';
import { AlertDialogComponent, AlertType } from '../shared/dialog/alert-dialog.component';

@Injectable({ providedIn: 'root' })
export class DialogService {

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  mostrar(message: string, type: AlertType = 'info', cambio: number = 0): Promise<void> {
    return new Promise((resolve) => {
      const componentRef = createComponent(AlertDialogComponent, {
        environmentInjector: this.injector
      });

      componentRef.instance.message = message;
      componentRef.instance.type = type;
      componentRef.instance.isConfirm = false;
      componentRef.instance.cambio = cambio;

      let host: HTMLElement;

      componentRef.instance.dialogResult.subscribe(() => {
        this.appRef.detachView(componentRef.hostView);
        componentRef.destroy();
        if (host && document.body.contains(host)) {
          document.body.removeChild(host);
        }
        resolve();
      });

      this.appRef.attachView(componentRef.hostView);
      host = (componentRef.hostView as any).rootNodes[0] as HTMLElement;
      document.body.appendChild(host);
      componentRef.changeDetectorRef.detectChanges();
    });
  }

  mostrarWifi(message: string, wifiUser: string, wifiPassword: string, type: AlertType = 'success'): Promise<void> {
    return new Promise((resolve) => {
      const componentRef = createComponent(AlertDialogComponent, {
        environmentInjector: this.injector
      });

      componentRef.instance.message = message;
      componentRef.instance.type = type;
      componentRef.instance.isConfirm = false;
      componentRef.instance.wifiUser = wifiUser;
      componentRef.instance.wifiPassword = wifiPassword;

      let host: HTMLElement;

      componentRef.instance.dialogResult.subscribe(() => {
        this.appRef.detachView(componentRef.hostView);
        componentRef.destroy();
        if (host && document.body.contains(host)) {
          document.body.removeChild(host);
        }
        resolve();
      });

      this.appRef.attachView(componentRef.hostView);
      host = (componentRef.hostView as any).rootNodes[0] as HTMLElement;
      document.body.appendChild(host);
      componentRef.changeDetectorRef.detectChanges();
    });
  }

  confirmar(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      const componentRef = createComponent(AlertDialogComponent, {
        environmentInjector: this.injector
      });

      componentRef.instance.message = message;
      componentRef.instance.type = 'warning';
      componentRef.instance.isConfirm = true;

      let host: HTMLElement;

      componentRef.instance.dialogResult.subscribe((result: boolean) => {
        this.appRef.detachView(componentRef.hostView);
        componentRef.destroy();
        if (host && document.body.contains(host)) {
          document.body.removeChild(host);
        }
        resolve(result);
      });

      this.appRef.attachView(componentRef.hostView);
      host = (componentRef.hostView as any).rootNodes[0] as HTMLElement;
      document.body.appendChild(host);
      componentRef.changeDetectorRef.detectChanges();
    });
  }
}
