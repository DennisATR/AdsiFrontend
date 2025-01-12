import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UsuarioModel } from '../modelos/usuario.model';
import { ConfiguracionRutasBackend } from '../config/configuracion.rutas.backend';
import { UsuarioValidadoModel } from '../modelos/usuario.validado.model';
import { cambiarClavemodel } from '../modelos/cambiarClave.model';

@Injectable({
  providedIn: 'root'
})
export class SeguridadService {
  urlBase: string = ConfiguracionRutasBackend.urlBackend;
  constructor( private http: HttpClient ) {
    this.validacionDeSesion();
   }

  IdentificarUsuario(usuario: string, clave: string): Observable<UsuarioModel> {
    return this.http.post<UsuarioModel>(`${this.urlBase}identificar-usuario`, {
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
    ObtenerDatosUsuarioIdentificado(): UsuarioModel| null {
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
      let objUsuario = JSON.parse(ls);
      this.ActualizarComportamientoUsuario(objUsuario);
      return objUsuario;
    }
    return null;
  }

  ActualizarComportamientoUsuario(datos: UsuarioValidadoModel) {
    return this.datosUsuarioValidado.next(datos);
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
    this.ActualizarComportamientoUsuario(new UsuarioValidadoModel());
  }

  RegistrarUsuario(datos: any): Observable<UsuarioModel> {
    return this.http.post<UsuarioModel>(`${this.urlBase}empleado`, datos);
  }

  CambiarClave(datos: any): Observable<cambiarClavemodel> {
    return this.http.patch<cambiarClavemodel>(
      `${this.urlBase}cambiar-clave`,
      datos
    );
  }

  // Método para obtener todos los usuarios
  obtenerUsuarios(): Observable<UsuarioModel[]> {
    return this.http.get<UsuarioModel[]>(`${this.urlBase}empleado`);
  }

}
