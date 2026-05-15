import { Component, OnDestroy, OnInit } from '@angular/core';
import { SeguridadService } from '../../../servicios/seguridad.service';
import { ItemEncabezadoModel } from '../../../modelos/item.encabezado.model';

declare const iniciarMenuLateral: any;
declare const destruirMenuLateral: any; // Si existe alguna función para destruir el menú
declare const M: any;

@Component({
  selector: 'app-menu-lateral',
  templateUrl: './menu-lateral.component.html',
  styleUrls: ['./menu-lateral.component.css']
})
export class MenuLateralComponent implements OnDestroy, OnInit {
  nombreUsuario: string = '';
  listaMenus: ItemEncabezadoModel[] = [];

  constructor(private servicioSeguridad: SeguridadService) {}

  ngOnInit() {
    this.servicioSeguridad.ObtenerDatosSesion().subscribe(datosUsuario => {
      let usuario = datosUsuario.user;
      this.nombreUsuario = usuario?.Nombre + ' ' + usuario?.Apellido;

      // Destruir y reiniciar el menú
      if (typeof destruirMenuLateral === 'function') {
        destruirMenuLateral();  // Destruye el menú si existe esa función
      }

      // Obtener items dinámicos del encabezado
      this.listaMenus = this.servicioSeguridad.ObtenerItemsEncabezado();

      setTimeout(() => {
        iniciarMenuLateral();  // Inicializa nuevamente el menú
      }, 0);
    });
  }

  ngAfterViewInit() {
    var elems = document.querySelectorAll('.sidenav');
    var instances = M.Sidenav.init(elems);

    var collapsibles = document.querySelectorAll('.collapsible')
    for (var i = 0; i < collapsibles.length; i++) {
      M.Collapsible.init(collapsibles[i]);
    }

  }

  ngOnDestroy() {
    // Si existe una función para destruir el menú lateral
    if (typeof destruirMenuLateral === 'function') {
      destruirMenuLateral();  // Asegura que se destruye cuando el componente se elimina
    }
  }
}

