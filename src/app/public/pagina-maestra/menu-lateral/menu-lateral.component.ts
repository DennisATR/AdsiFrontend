import { Component, OnDestroy, OnInit } from '@angular/core';
import { SeguridadService } from '../../../servicios/seguridad.service';
import { ItemEncabezadoModel } from '../../../modelos/item.encabezado.model';
import { InformacionService } from '../../../servicios/parametros/informacion.service';
import { DomSanitizer } from '@angular/platform-browser';

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
  nombreRol: string = '';
  nombreLocal: string = '';
  listaMenus: ItemEncabezadoModel[] = [];

  constructor(
    private servicioSeguridad: SeguridadService,
    private informacionService: InformacionService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    // Cargar nombre del local
    this.informacionService.ObtenerInformacion().subscribe((lista: any[]) => {
      if (lista && lista.length > 0) {
        this.nombreLocal = lista[0].Nombre || 'Mi Local';
      }
    });

    this.servicioSeguridad.ObtenerDatosSesion().subscribe((datosUsuario: any) => {
      let usuario = datosUsuario.user;
      this.nombreUsuario = (usuario?.Nombre || '') + ' ' + (usuario?.Apellido || '');

      // Resolver nombre del rol
      if (usuario?.rolId) {
        this.servicioSeguridad.ObtenerRoles().subscribe((roles: any[]) => {
          const rol = roles.find((r: any) => r.id === usuario.rolId);
          this.nombreRol = rol?.Nombre || '';
        });
      }

      // Destruir y reiniciar el menú
      if (typeof destruirMenuLateral === 'function') {
        destruirMenuLateral();
      }

      // Obtener items dinámicos del encabezado
      this.listaMenus = this.servicioSeguridad.ObtenerItemsEncabezado();
      this.listaMenus.forEach(menu => {
        if (menu.icono) {
          menu.safeIcono = this.sanitizer.bypassSecurityTrustHtml(menu.icono);
        }
      });

      setTimeout(() => {
        iniciarMenuLateral();
      }, 0);
    });
  }

  tienePermiso(idMenu: string): boolean {
    return this.listaMenus.some(m => String(m.idMenu) === idMenu);
  }

  get modulosMovil(): ItemEncabezadoModel[] {
    return this.listaMenus.filter(m => String(m.idMenu) !== '11' && String(m.idMenu) !== '14' && String(m.idMenu) !== '21');
  }

  cerrarMenu() {
    const elems = document.querySelectorAll('.sidenav');
    elems.forEach((el: any) => {
      const instance = M.Sidenav.getInstance(el);
      if (instance) {
        instance.close();
      }
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

