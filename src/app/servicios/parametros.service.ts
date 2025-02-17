import { Injectable } from '@angular/core';
import { ConfiguracionRutasBackend } from '../config/configuracion.rutas.backend';
import { HttpClient } from '@angular/common/http';
import { ZapatoModel } from '../modelos/zapato.model';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParametrosService {
  urlBase: string = ConfiguracionRutasBackend.urlBackend;

  constructor(private http: HttpClient ) { }

  RegistrarZapato(datos: any) {
    console.log(datos);
    return this.http.post(`${this.urlBase}zapato`, datos).pipe(
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

  // Método para obtener todos los usuarios
  ObtenerZapatos(): Observable<ZapatoModel[]> {
  return this.http.get<ZapatoModel[]>(`${this.urlBase}zapato`);
  }

}
