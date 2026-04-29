import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { ConfiguracionRutasBackend } from '../../config/configuracion.rutas.backend';
import { HttpClient } from '@angular/common/http';
import { CreditoModel } from '../../modelos/credito.model';
import { CreditoDetalleModel } from '../../modelos/creditoDetalle.model';

@Injectable({
  providedIn: 'root'
})
export class CreditoService {


  urlBase: string = ConfiguracionRutasBackend.urlBackend;

  constructor(private http: HttpClient) { }

  RegistrarCredito(datos: any) {
    console.log(datos);
    return this.http.post(`${this.urlBase}credito`, datos).pipe(
      catchError(error => {
        console.error('Error al registrar el crédito:', error);
        return throwError(() => error);
      })
    );
  }

  ObtenerCreditoDetalle(id: number): Observable<CreditoDetalleModel> {
    return this.http.get<CreditoDetalleModel>(`${this.urlBase}credito/detalle/${id}`);
  }

  ObtenerCreditosPorNombreCliente(nombre: string): Observable<CreditoModel[]> {
    return this.http.get<CreditoModel[]>(`${this.urlBase}credito/buscar?nombre=${encodeURIComponent(nombre)}`);
  }

  ObtenerCreditosPorFacturaId(facturaId: number): Observable<CreditoModel[]> {
    return this.http.get<CreditoModel[]>(`${this.urlBase}credito/buscar?facturaId=${facturaId}`);
  }

  ObtenerCreditos(): Observable<CreditoModel[]> {
    return this.http.get<CreditoModel[]>(`${this.urlBase}credito`);
  }

  BuscarCredito(id: number): Observable<CreditoModel> {
    return this.http.get<CreditoModel>(`${this.urlBase}credito/${id}`);
  }

  EliminarCredito(id: number): Observable<any> {
    return this.http.delete<any>(`${this.urlBase}credito/${id}`);
  }

  EditarCredito(id: number, datos: any): Observable<any> {
    return this.http.put<any>(`${this.urlBase}credito/${id}`, datos);
  }
  
}
