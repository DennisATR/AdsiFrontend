import { Injectable } from '@angular/core';
import { ConfiguracionRutasBackend } from '../../config/configuracion.rutas.backend';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { CierreCajaModel } from '../../modelos/cierreCaja.model';

@Injectable({
  providedIn: 'root'
})
export class CierreCajaService {
  urlBase: string = ConfiguracionRutasBackend.urlBackend;
  
  constructor(private http: HttpClient) { }
  
  RegistrarCierreCaja(datos: any) {
    console.log(datos);
    return this.http.post(`${this.urlBase}cierre-caja`, datos).pipe(
      catchError(error => {
        console.error('Error al registrar el cierre de caja:', error);
        return throwError(() => error);
      })
    );
  }
  
  ObtenerCierresCaja(): Observable<CierreCajaModel[]> {
    return this.http.get<CierreCajaModel[]>(`${this.urlBase}cierre-caja`);
  }

  BuscarCierreCaja(id: number): Observable<CierreCajaModel> {
    return this.http.get<CierreCajaModel>(`${this.urlBase}cierre-caja/${id}`);
  }

  EliminarCierreCaja(id: number): Observable<any> {
    return this.http.delete<any>(`${this.urlBase}cierre-caja/${id}`);
  }

  EditarCierreCaja(id: number, datos: any): Observable<any> {
    return this.http.put<any>(`${this.urlBase}cierre-caja/${id}`, datos).pipe(
      catchError(error => {
        console.error('Error al editar el cierre de caja:', error);
        return throwError(() => error);
      })
    );
  }

}
