import { Component, OnInit } from '@angular/core';
import { SeguridadService } from '../../../servicios/seguridad.service';
import { UsuarioValidadoModel } from '../../../modelos/usuario.validado.model';
import { ConfiguracionEncabezado } from '../../../config/configuracion.encabezado';
import { ItemEncabezadoModel } from '../../../modelos/item.encabezado.model';
import { NotificacionService } from '../../../servicios/ventas/notificacion.service';
import { NotificacionModel } from '../../../modelos/notificacion.model';

@Component({
  selector: 'app-encabezado',
  templateUrl: './encabezado.component.html',
  styleUrls: ['./encabezado.component.css']
})
export class EncabezadoComponent implements OnInit {
  listaMenus: ItemEncabezadoModel[] = [];
  sesionActiva: boolean = false;
  notificaciones: NotificacionModel[] = [];
  mostrarDropdown: boolean = false;

  constructor(
    private servicioSeguridad: SeguridadService,
    private notificacionService: NotificacionService
  ) {}

  get tienePermisoNotificaciones(): boolean {
    return this.listaMenus.some(m => String(m.idMenu) === '21' || m.texto === 'Notificaciones');
  }

  get menusNavegacion(): ItemEncabezadoModel[] {
    return this.listaMenus.filter(m => String(m.idMenu) !== '21' && String(m.idMenu) !== '11' && String(m.idMenu) !== '14' && m.texto !== 'Notificaciones');
  }

  ngOnInit() {
    this.ValidarSesion();
    this.notificacionService.notificaciones$.subscribe((list) => {
      this.notificaciones = list;
    });
  }

  toggleDropdown() {
    this.mostrarDropdown = !this.mostrarDropdown;
    if (this.mostrarDropdown && this.tienePermisoNotificaciones) {
      this.notificacionService.cargarPendientes().subscribe();
    }
  }

  ValidarSesion() {
    this.servicioSeguridad.ObtenerDatosSesion().subscribe({
      next: (datos: UsuarioValidadoModel) => {
        if (datos.user != null) {
          this.sesionActiva = true;
          this.listaMenus = this.servicioSeguridad.ObtenerItemsEncabezado();
          if (this.tienePermisoNotificaciones) {
            this.notificacionService.cargarPendientes().subscribe();
          }
        } else {
          this.sesionActiva = false;
          this.listaMenus = [];
        }
      },
      error: (err: any) => {

      }
    });
  }
}