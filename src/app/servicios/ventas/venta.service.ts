import { Injectable } from '@angular/core';
import { ConfiguracionRutasBackend } from '../../config/configuracion.rutas.backend';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { VentaModel } from '../../modelos/venta.model';
import { CantidadZapatos } from '../../modelos/cantidadZapatos.model';
import { ResumenDelDiaVentasModel } from '../../modelos/resumenDelDiaVentas.model';

@Injectable({
  providedIn: 'root'
})
export class VentaService {

  urlBase: string = ConfiguracionRutasBackend.urlBackend;

  constructor(private http: HttpClient) { }

  RegistrarVenta(datos: any) {
    console.log(datos);
    return this.http.post(`${this.urlBase}venta`, datos).pipe(
      catchError(error => {
        console.error('Error al registrar la venta:', error);
        return throwError(() => error);
      })
    );
  }

  ObtenerVenta(): Observable<VentaModel[]> {
    return this.http.get<VentaModel[]>(`${this.urlBase}venta`);
  }

  BuscarVenta(id: string): Observable<VentaModel> {
    return this.http.get<VentaModel>(`${this.urlBase}venta/${id}`);
  }

  EliminarVenta(id: string): Observable<any> {
    return this.http.delete<any>(`${this.urlBase}venta/${id}`);
  }

  EditarVenta(id: string, datos: any): Observable<any> {
    return this.http.put<any>(`${this.urlBase}venta/${id}`, datos);
  }

  ObtenerCantidadZapatosVendidosPorFecha(fecha: string): Observable<CantidadZapatos> {
    return this.http.get<CantidadZapatos>(`${this.urlBase}venta/cantidad-zapatos-vendidos/fecha/${fecha}`);
  }

  ObtenerResumenDelDia(fecha: string): Observable<ResumenDelDiaVentasModel[]> {
    return this.http.get<ResumenDelDiaVentasModel[]>(`${this.urlBase}venta/resumen-dia/fecha/${fecha}`);
  }

  ObtenerVentasPorFactura(facturaId: string): Observable<VentaModel[]> {
    return this.http.get<VentaModel[]>(`${this.urlBase}venta/factura/${facturaId}/devoluciones-elegibles`).pipe(
      catchError(error => {
        // Si el endpoint no existe, retornar array vacío
        console.warn('No se encontraron ventas para la factura:', facturaId);
        return throwError(() => error);
      })
    );
  }
}
