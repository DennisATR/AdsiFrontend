import { Injectable } from '@angular/core';
import { ConfiguracionRutasBackend } from '../../config/configuracion.rutas.backend';
import { HttpClient } from '@angular/common/http';
import { ZapatoModel } from '../../modelos/zapato.model';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ZapatoService {
  urlBase: string = ConfiguracionRutasBackend.urlBackend;

  constructor(private http: HttpClient) { }

  RegistrarZapato(datos: any) {
    console.log(datos);
    return this.http.post(`${this.urlBase}zapato`, datos).pipe(
      catchError(error => {
        console.error('Error al registrar el zapato:', error);
        return throwError(() => error);
      })
    );
  }

  RegistrarZapatoSerie(datos: any) {
  return this.http.post(`${this.urlBase}zapato/crearSerie`, datos).pipe(
    catchError(error => {
      console.error('Error al registrar el zapato en serie:', error);
      return throwError(() => error);
    })
  );
}


  ObtenerZapatos(): Observable<ZapatoModel[]> {
    return this.http.get<ZapatoModel[]>(`${this.urlBase}zapato`);
  }

  BuscarZapato(id: string): Observable<ZapatoModel> {
    return this.http.get<ZapatoModel>(`${this.urlBase}zapato/${id}`);
  }

  EliminarZapato(id: string): Observable<any> {
    return this.http.delete<any>(`${this.urlBase}zapato/${id}`);
  }

  EditarZapato(id: string, datos: any): Observable<any> {
    return this.http.put<any>(`${this.urlBase}zapato/${id}`, datos);
  }

  ObtenerReferencia(id: string): Observable<{ referencia: string }> {
    return this.http.get<{ referencia: string }>(`${this.urlBase}zapato/referencia/${id}`);
  }
}