import { Injectable } from '@angular/core';
import { ConfiguracionRutasBackend } from '../../config/configuracion.rutas.backend';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { InformacionModel } from '../../modelos/informacion.model';
import { AlmacenModel } from '../../modelos/almacen.model';

@Injectable({
  providedIn: 'root'
})
export class InformacionService {
  urlBase: string = ConfiguracionRutasBackend.urlBackend;
 
   constructor(private http: HttpClient) { }
   RegistrarInformacion(datos: any) {
     console.log(datos);
     return this.http.post(`${this.urlBase}infolocal`, datos).pipe(
       catchError(error => {
         console.error('Error al registrar la informacion:', error);
         return throwError(() => error);
       })
     );
   }
   // Método para obtener todos los gastos
   ObtenerInformacion(): Observable<InformacionModel[]> {
     return this.http.get<InformacionModel[]>(`${this.urlBase}infolocal`);
   }
 
   BuscarInformacion(id: number): Observable<InformacionModel> {
     return this.http.get<InformacionModel>(`${this.urlBase}infolocal/${id}`);
   }
 
   EliminarInformacion(id: number): Observable<any> {
     return this.http.delete<any>(`${this.urlBase}infolocal/${id}`);
   }

   ActualizarInformacion(id: number, datos: any): Observable<any> {
     return this.http.put<any>(`${this.urlBase}infolocal/${id}`, datos).pipe(
       catchError(error => {
         console.error('Error al actualizar la informacion:', error);
         return throwError(() => error);
       })
     );
    }

    RegistrarAlmacen(datos: any) {
      console.log(datos);
      return this.http.post(`${this.urlBase}almacenes`, datos).pipe(
        catchError(error => {
          console.error('Error al registrar el almacen:', error);
          return throwError(() => error);
        })
      );
    }

    ObtenerAlmacenes(): Observable<AlmacenModel[]> {
      return this.http.get<AlmacenModel[]>(`${this.urlBase}almacenes`);
    }

    BuscarAlmacen(id: number): Observable<AlmacenModel> {
      return this.http.get<AlmacenModel>(`${this.urlBase}almacenes/${id}`);
    }

    EliminarAlmacen(id: number): Observable<any> {
      return this.http.delete<any>(`${this.urlBase}almacenes/${id}`);
    }

    EditarAlmacen(id: number, datos: any): Observable<any> {
      return this.http.put<any>(`${this.urlBase}almacenes/${id}`, datos).pipe(
        catchError(error => {
          console.error('Error al editar el almacen:', error);
          return throwError(() => error);
        })
      );
    }
 }
 
