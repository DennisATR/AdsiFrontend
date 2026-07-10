import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {catchError, Observable, throwError} from 'rxjs';
import {ConfiguracionRutasBackend} from '../../config/configuracion.rutas.backend';
import {FacturaModel} from '../../modelos/factura.model';

@Injectable({
  providedIn: 'root'
})
export class FacturaService {


  urlBase: string = ConfiguracionRutasBackend.urlBackend;

  constructor(private http: HttpClient) { }

  RegistrarFactura(datos: any) {
    console.log(datos);
    return this.http.post(`${this.urlBase}factura`, datos).pipe(
      catchError(error => {
        console.error('Error al registrar la factura:', error);
        return throwError(() => error);
      })
    );
  }

  ObtenerFacturas(): Observable<FacturaModel[]> {
    return this.http.get<FacturaModel[]>(`${this.urlBase}factura`);
  }

  BuscarFactura(id: string): Observable<FacturaModel> {
    return this.http.get<FacturaModel>(`${this.urlBase}factura/${id}`);
  }

  EliminarFactura(id: string): Observable<any> {
    return this.http.delete<any>(`${this.urlBase}factura/${id}`);
  }

  EditarFactura(id: string, datos: any): Observable<any> {
    return this.http.put<any>(`${this.urlBase}factura/${id}`, datos);
  }

  ImprimirFacturaServidor(id: number): Observable<any> {
    return this.http.post<any>(`${this.urlBase}factura/${id}/imprimir-servidor`, {});
  }

}
