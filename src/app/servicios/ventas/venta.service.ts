import { Injectable } from '@angular/core';
import { ConfiguracionRutasBackend } from '../../config/configuracion.rutas.backend';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { VentaModel } from '../../modelos/venta.model';

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

  ObtenerCantidadZapatosVendidosPorFecha(fecha: string): Observable<number> {
    return this.http
      .get<number | VentaModel[] | Record<string, unknown>>(`${this.urlBase}venta/cantidad-zapatos-vendidos/fecha/${fecha}`)
      .pipe(map((respuesta) => this.NormalizarCantidadZapatosVendidos(respuesta)));
  }

  private NormalizarCantidadZapatosVendidos(respuesta: number | VentaModel[] | Record<string, unknown>): number {
    if (typeof respuesta === 'number') {
      return respuesta;
    }

    if (Array.isArray(respuesta)) {
      return respuesta.reduce((total, venta) => total + Number(venta.Cantidad ?? 0), 0);
    }

    const cantidad = respuesta['cantidad']
      ?? respuesta['Cantidad']
      ?? respuesta['total']
      ?? respuesta['totalZapatosVendidos']
      ?? respuesta['numeroArticulos']
      ?? respuesta['NumeroArticulos'];

    return Number(cantidad ?? 0);
  }

}
