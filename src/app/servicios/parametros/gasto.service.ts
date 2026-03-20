import { Injectable } from '@angular/core';
import { ConfiguracionRutasBackend } from '../../config/configuracion.rutas.backend';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { GastoModel } from '../../modelos/gasto.model';
import { ResumenDelDiaGastosModel } from '../../modelos/resumenDelDiaGastos.model';

@Injectable({
  providedIn: 'root'
})
export class GastoService {
  urlBase: string = ConfiguracionRutasBackend.urlBackend;

  constructor(private http: HttpClient) { }
  RegistrarGasto(datos: any) {
    console.log(datos);
    return this.http.post(`${this.urlBase}gastos`, datos).pipe(
      catchError(error => {
        console.error('Error al registrar el gasto:', error);
        return throwError(() => error);
      })
    );
  }
  // Método para obtener todos los gastos
  ObtenerGastos(): Observable<GastoModel[]> {
    return this.http.get<GastoModel[]>(`${this.urlBase}gastos`);
  }

  BuscarGasto(id: number): Observable<GastoModel> {
    return this.http.get<GastoModel>(`${this.urlBase}gastos/${id}`);
  }

  EliminarGasto(id: number): Observable<any> {
    return this.http.delete<any>(`${this.urlBase}gastos/${id}`);
  }

  EditarGasto(id: number, datos: any): Observable<any> {
    return this.http.put<any>(`${this.urlBase}gastos/${id}`, datos).pipe(
      catchError(error => {
        console.error('Error al editar el gasto:', error);
        return throwError(() => error);
      })
    );
  }

  BuscarGastosPorFecha(fecha: string): Observable<GastoModel[]> {
    return this.http.get<GastoModel[]>(`${this.urlBase}gastos/buscarporfecha/${fecha}`);
  }

  ObtenerResumenDelDia(fecha: string): Observable<ResumenDelDiaGastosModel[]> {
    return this.http.get<ResumenDelDiaGastosModel[]>(`${this.urlBase}gastos/resumen-dia/fecha/${fecha}`);
  }

}
