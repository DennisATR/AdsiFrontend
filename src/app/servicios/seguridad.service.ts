import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UsuarioModel } from '../modelos/usuario.model';
import { ConfiguracionRutasBackend } from '../config/configuracion.rutas.backend';

import { UsuarioValidadoModel } from '../modelos/usuario.validado.model';
import { RolModel } from '../modelos/rol.model';
import { PermisoModel } from '../modelos/permiso.model';
import { ConfiguracionEncabezado } from '../config/configuracion.encabezado';
import { ItemEncabezadoModel } from '../modelos/item.encabezado.model';

@Injectable({
  providedIn: 'root'
})
export class SeguridadService {
  urlBase: string = ConfiguracionRutasBackend.urlBackend;
  constructor(private http: HttpClient) {
    this.validacionDeSesion();
  }

  IdentificarUsuario(usuario: string, clave: string): Observable<UsuarioValidadoModel> {
    return this.http.post<UsuarioValidadoModel>(`${this.urlBase}identificar-usuario`, {
      correo: usuario,
      clave: clave
    });
  }


  RecuperarClavePorUsuario(usuario: string): Observable<UsuarioModel> {
    return this.http.post<UsuarioModel>(`${this.urlBase}recuperar-clave`, {
      correo: usuario
    });
  }

  /**
 * Almacena los datos del usuario
 * @param datos datos del usuario
 */
  AlmacenarDatosUsuarioIdentificado(datos: UsuarioModel): boolean {
    let cadena = JSON.stringify(datos);
    let datosLS = localStorage.getItem("datos-usuario");
    if (datosLS) {
      return false;
    } else {
      localStorage.setItem("datos-usuario", cadena);
      return true;
    }
  }

  /**
   * Obtiene los datos del usuario
   */
  /**
   * Obtiene los datos del usuario
   */
  ObtenerDatosUsuarioIdentificado(): UsuarioModel | null {
    let ls = localStorage.getItem("datos-sesion");
    if (!ls) return null;
    
    // Validar expiración diaria de sesión
    const hoy = new Date().toLocaleDateString('sv-SE', {timeZone: 'America/Bogota'});
    const fechaSesion = localStorage.getItem("fecha-sesion");
    if (fechaSesion !== hoy) {
      this.RemoverDatosUsuarioValidado();
      return null;
    }

    let datosLS = localStorage.getItem("datos-usuario");
    if (datosLS) {
      let datos = JSON.parse(datosLS);
      return datos;
    } else {
      return null;
    }
  }

  AlmacenarDatosUsuarioValidado(datos: UsuarioValidadoModel): boolean {
    let datosLS = localStorage.getItem("datos-sesion");
    if (datosLS != null) {
      return false;
    } else {
      let datosString = JSON.stringify(datos);
      localStorage.setItem("datos-sesion", datosString);
      const hoy = new Date().toLocaleDateString('sv-SE', {timeZone: 'America/Bogota'});
      localStorage.setItem("fecha-sesion", hoy);
      // Si la respuesta incluye permisos, construir y almacenar el encabezado
      if (datos.menu && datos.menu.length > 0) {
        this.ConstruirEncabezado(datos.menu);
      }
      this.ActualizarComportamientoUsuario(datos);
      return true;
    }
  }

  /** Administración de la sesión de usuario */

  datosUsuarioValidado = new BehaviorSubject<UsuarioValidadoModel>(new UsuarioValidadoModel());

  ObtenerDatosSesion(): Observable<UsuarioValidadoModel> {
    return this.datosUsuarioValidado.asObservable();
  }

  validacionDeSesion(): UsuarioValidadoModel | null {
    let ls = localStorage.getItem("datos-sesion");
    if (ls) {
      const hoy = new Date().toLocaleDateString('sv-SE', {timeZone: 'America/Bogota'});
      const fechaSesion = localStorage.getItem("fecha-sesion");
      if (fechaSesion !== hoy) {
        // La sesión fue iniciada en un día anterior -> expirar automáticamente la sesión
        this.RemoverDatosUsuarioValidado();
        return null;
      }
      let objUsuario = JSON.parse(ls);
      this.ActualizarComportamientoUsuario(objUsuario);
      return objUsuario;
    }
    return null;
  }

  ActualizarComportamientoUsuario(datos: UsuarioValidadoModel) {
    return this.datosUsuarioValidado.next(datos);
  }


  ConstruirEncabezado(permisos: PermisoModel[]) {
  let menu: ItemEncabezadoModel[] = [];

  permisos.forEach((permiso) => {
    let datosRuta = ConfiguracionEncabezado.listaMenus
      .filter(x => 
        x.id == permiso.menuId && permiso[x.accion as keyof PermisoModel]
      );

    if (datosRuta.length > 0) {
      let item = new ItemEncabezadoModel();
      item.idMenu = permiso.menuId;
      item.ruta = datosRuta[0].ruta;
      item.texto = datosRuta[0].texto;
      item.icono = (datosRuta[0] as any).icono;

      menu.push(item);
    }
  });

  this.AlmacenarItemsEncabezado(menu);
}

  AlmacenarItemsEncabezado(items: ItemEncabezadoModel[]) {
    let menuString = JSON.stringify(items);
    localStorage.setItem("menu-encabezado", menuString);
  }
  
  ObtenerItemsEncabezado(): ItemEncabezadoModel[] {
    let menu: ItemEncabezadoModel[] = [];
    let menuString = localStorage.getItem("menu-encabezado");
    if (menuString) {
      menu = JSON.parse(menuString);
    }
    return menu;
  }

  RemoverDatosUsuarioValidado() {
    let datosUsuario = localStorage.getItem("datos-usuario");
    let datosSesion = localStorage.getItem("datos-sesion");
    if (datosUsuario) {
      localStorage.removeItem("datos-usuario");
    }
    if (datosSesion) {
      localStorage.removeItem("datos-sesion");
    }
    localStorage.removeItem("menu-lateral");
    localStorage.removeItem("menu-encabezado");
    localStorage.removeItem("fecha-sesion");
    localStorage.removeItem("fecha-base-caja");
    localStorage.removeItem("cierre-caja-id");
    this.ActualizarComportamientoUsuario(new UsuarioValidadoModel());
  }

  RegistrarUsuario(datos: any): Observable<UsuarioModel> {
    console.log(datos);

    return this.http.post<UsuarioModel>(`${this.urlBase}usuario`, {
      Nombre: datos.Nombre,
      Telefono: datos.Telefono,
      Apellido: datos.Apellido,
      Clave: datos.Clave,
      Correo: datos.Correo,
      rolId: datos.rolId
    })
      .pipe(
        catchError(error => {
          console.error('Error al registrar al usuario:', error);
          return throwError(() => error);
        })
      );
  }

  // Método para obtener todos los usuarios
  obtenerUsuarios(): Observable<UsuarioModel[]> {
    return this.http.get<UsuarioModel[]>(`${this.urlBase}usuario`);
  }

  BuscarUsuario(id: number): Observable<UsuarioModel> {
    return this.http.get<UsuarioModel>(`${this.urlBase}usuario/${id}`);
  }

  EditarUsuario(id: number, datos: any): Observable<any> {
    console.log(datos);
    try {
      return this.http.put<any>(`${this.urlBase}usuario/${id}`, datos);
    } catch (error) {
      console.error('Error al editar el usuario:', error);
      return throwError(() => error);
    }
  }

  EliminarUsuario(id: number): Observable<any> {
    return this.http.delete<any>(`${this.urlBase}usuario/${id}`);
  }

  //  Metodo para obtener todos los roles
  ObtenerRoles(): Observable<RolModel[]> {
    return this.http.get<RolModel[]>(`${this.urlBase}rol`);
  }

  ObtenerTokenLocalStorage():string {
    let ls = localStorage.getItem("datos-sesion");
    if (ls) {
      let usuario: UsuarioValidadoModel = JSON.parse(ls);
      return usuario.token!;
    } else {
      return "";
    }
  }

}
