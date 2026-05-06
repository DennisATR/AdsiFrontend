import { Component } from '@angular/core';
import { SeguridadService } from '../../../servicios/seguridad.service';
import { UsuarioValidadoModel } from '../../../modelos/usuario.validado.model';
import { ConfiguracionEncabezado } from '../../../config/configuracion.encabezado';
import { ItemEncabezadoModel } from '../../../modelos/item.encabezado.model';


@Component({
  selector: 'app-encabezado',
  templateUrl: './encabezado.component.html',
  styleUrls: ['./encabezado.component.css']
})
export class EncabezadoComponent {
  listaMenus: ItemEncabezadoModel[] = ConfiguracionEncabezado.listaMenus;
  constructor(
    private servicioSeguridad: SeguridadService
  ) {

  }

  sesionActiva: boolean = false;

  ngOnInit() {
    this.ValidarSesion();
    this.listaMenus = this.servicioSeguridad.ObtenerItemsEncabezado();
  }

  ValidarSesion() {
    this.servicioSeguridad.ObtenerDatosSesion().subscribe({
      next: (datos: UsuarioValidadoModel) => {
        if (datos.user != null) {
          this.sesionActiva = true;
          this.listaMenus = this.servicioSeguridad.ObtenerItemsEncabezado();
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