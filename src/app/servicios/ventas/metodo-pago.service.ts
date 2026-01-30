import { Injectable } from '@angular/core';
import { ConfiguracionRutasBackend } from '../../config/configuracion.rutas.backend';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { FacturaModel } from '../../modelos/factura.model';
import { MetodoPagoModel } from '../../modelos/metodoPago.model';

@Injectable({
  providedIn: 'root'
})
export class MetodoPagoService {

  urlBase: string = ConfiguracionRutasBackend.urlBackend;

  constructor(private http: HttpClient) { }

  RegistrarMetodoPago(datos: any) {
    console.log(datos);
    return this.http.post(`${this.urlBase}metodo-pago`, datos).pipe(
      catchError(error => {
        console.error('Error al registrar el método de pago:', error);
        return throwError(() => error);
      })
    );
  }

  ObtenerMetodosPago(): Observable<MetodoPagoModel[]> {
    return this.http.get<MetodoPagoModel[]>(`${this.urlBase}metodo-pago`);
  }

  BuscarMetodoPago(id: string): Observable<MetodoPagoModel> {
    return this.http.get<MetodoPagoModel>(`${this.urlBase}metodo-pago/${id}`);
  }

  EliminarMetodoPago(id: string): Observable<any> {
    return this.http.delete<any>(`${this.urlBase}metodo-pago/${id}`);
  }

  EditarMetodoPago(id: string, datos: any): Observable<any> {
    return this.http.put<any>(`${this.urlBase}metodo-pago/${id}`, datos);
  }
  
}
