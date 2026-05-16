import { Injectable } from '@angular/core';
import { ConfiguracionRutasBackend } from '../../config/configuracion.rutas.backend';
import { catchError, Observable, throwError } from 'rxjs';
import { DevolucionModel } from '../../modelos/devolucion.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DevolucionService {


  urlBase: string = ConfiguracionRutasBackend.urlBackend;

  constructor(private http: HttpClient) { }

  RegistrarDevolucion(datos: any) {
    console.log(datos);
    return this.http.post(`${this.urlBase}devolucion`, datos).pipe(
      catchError(error => {
        console.error('Error al registrar la devolucion:', error);
        return throwError(() => error);
      })
    );
  }

  ObtenerDevoluciones(): Observable<DevolucionModel[]> {
    return this.http.get<DevolucionModel[]>(`${this.urlBase}devolucion`);
  }

  BuscarDevolucion(id: string): Observable<DevolucionModel> {
    return this.http.get<DevolucionModel>(`${this.urlBase}devolucion/${id}`);
  }

  EliminarDevolucion(id: string): Observable<any> {
    return this.http.delete<any>(`${this.urlBase}devolucion/${id}`);
  }

  EditarDevolucion(id: string, datos: any): Observable<any> {
    return this.http.put<any>(`${this.urlBase}devolucion/${id}`, datos);
  }
  
}