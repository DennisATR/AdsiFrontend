import { Injectable } from '@angular/core';
import { ConfiguracionRutasBackend } from '../../config/configuracion.rutas.backend';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { EntregaModel } from '../../modelos/entrega.model';
import { ResumenDelDiaEntregasModel } from '../../modelos/resumenDelDiaEntregas.model';

@Injectable({
  providedIn: 'root'
})
export class EntregaService {
  urlBase: string = ConfiguracionRutasBackend.urlBackend;

  constructor(private http: HttpClient) { }
  RegistrarEntrega(datos: any) {
    console.log(datos);
    return this.http.post(`${this.urlBase}entrega`, datos).pipe(
      catchError(error => {
        console.error('Error al registrar la entrega:', error);
        return throwError(() => error);
      })
    );
  }
  // Método para obtener todas las entregas
  ObtenerEntregas(): Observable<EntregaModel[]> {
    return this.http.get<EntregaModel[]>(`${this.urlBase}entrega`);
  }

  BuscarEntrega(id: number): Observable<EntregaModel> {
    return this.http.get<EntregaModel>(`${this.urlBase}entrega/${id}`);
  }

  EliminarEntrega(id: number): Observable<any> {
    return this.http.delete<any>(`${this.urlBase}entrega/${id}`);
  }

  EditarEntrega(id: number, datos: any): Observable<any> {
    return this.http.put<any>(`${this.urlBase}entrega/${id}`, datos).pipe(
      catchError(error => {
        console.error('Error al editar la entrega:', error);
        return throwError(() => error);
      })
    );
  }

  BuscarEntregasPorFecha(fecha: string): Observable<EntregaModel[]> {
    return this.http.get<EntregaModel[]>(`${this.urlBase}entrega/buscarporfecha/${fecha}`);
  }

  ObtenerResumenDelDia(fecha: string): Observable<ResumenDelDiaEntregasModel[]> {
    return this.http.get<ResumenDelDiaEntregasModel[]>(`${this.urlBase}entrega/resumen-dia/fecha/${fecha}`);
  }
}

