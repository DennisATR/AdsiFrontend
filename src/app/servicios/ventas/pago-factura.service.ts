import { Injectable } from '@angular/core';
import { ConfiguracionRutasBackend } from '../../config/configuracion.rutas.backend';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { PagoFacturaModel } from '../../modelos/pagoFactura.model';

@Injectable({
  providedIn: 'root'
})
export class PagoFacturaService {

  urlBase: string = ConfiguracionRutasBackend.urlBackend;

  constructor(private http: HttpClient) { }

  RegistrarPagoFactura(datos: any) {
    console.log(datos);
    return this.http.post(`${this.urlBase}pago-factura`, datos).pipe(
      catchError(error => {
        console.error('Error al registrar el pago de la factura:', error);
        return throwError(() => error);
      })
    );
  }

  ObtenerPagoFactura(): Observable<PagoFacturaModel[]> {
    return this.http.get<PagoFacturaModel[]>(`${this.urlBase}pago-factura`);
  }

  ObtenerPagosPorFactura(facturaId: number): Observable<PagoFacturaModel[]> {
    return this.http.get<PagoFacturaModel[]>(`${this.urlBase}pago-factura/factura/${facturaId}`).pipe(
      catchError(error => {
        console.error(`Error al obtener pagos de la factura ${facturaId}:`, error);
        return throwError(() => error);
      })
    );
  }

  BuscarPagoFactura(id: string): Observable<PagoFacturaModel> {
    return this.http.get<PagoFacturaModel>(`${this.urlBase}pago-factura/${id}`);
  }

  EliminarPagoFactura(id: string): Observable<any> {
    return this.http.delete<any>(`${this.urlBase}pago-factura/${id}`);
  }

  EditarPagoFactura(id: string, datos: any): Observable<any> {
    return this.http.put<any>(`${this.urlBase}pago-factura/${id}`, datos);
  }
}
