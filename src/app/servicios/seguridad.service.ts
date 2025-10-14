import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UsuarioModel } from '../modelos/usuario.model';
import { ConfiguracionRutasBackend } from '../config/configuracion.rutas.backend';
import { UsuarioValidadoModel } from '../modelos/usuario.validado.model';
import { cambiarClavemodel } from '../modelos/cambiarClave.model';
import { RolModel } from '../modelos/rol.model';

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
    console.log(datos);
    
    return this.http.post<UsuarioModel>(`${this.urlBase}empleado`, {
        Nombre: datos.Nombre,
        Telefono: datos.Telefono,
        FechaReg: new Date().toISOString(),
        Apellido: datos.Apellido,
        Clave: datos.Clave,
        Correo: datos.Correo,
        rolId: datos.rolId
      })
      .pipe(
        catchError(error => {
          // Mostrar detalles del error en consola
          console.error('Error al registrar usuario:', error);
          
          // Mostrar el error específico desde la respuesta del servidor
          if (error.error) {
            console.error('Detalles del error:', error.error);
          }
          
          return throwError(() => new Error('Hubo un error al registrar el usuario.'));
        })
      );
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

  BuscarUsuario(id: number): Observable<UsuarioModel>{
    return this.http.get<UsuarioModel>(`${this.urlBase}empleado/${id}`);
  }

  EditarUsuario(id: number, datos: any): Observable<any>{
    console.log(datos);
    try {
      return this.http.put<any>(`${this.urlBase}empleado/${id}`, datos);
    } catch (error) {
      console.error('Error al editar el usuario:', error);
      throw new Error('Hubo un error al editar el usuario.');
    }
  }

  EliminarUsuario(id: number): Observable<any> {
    return this.http.delete<any>(`${this.urlBase}empleado/${id}`);
  }

  //  Metodo para obtener todos los roles
  ObtenerRoles(): Observable<RolModel[]> {
    return this.http.get<RolModel[]>(`${this.urlBase}rol`);
  }
}
