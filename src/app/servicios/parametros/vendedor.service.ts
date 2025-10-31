import { Injectable } from '@angular/core';
import { ConfiguracionRutasBackend } from '../../config/configuracion.rutas.backend';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { VendedorModel } from '../../modelos/vendedor.model';

@Injectable({
  providedIn: 'root'
})
export class VendedorService {
  urlBase: string = ConfiguracionRutasBackend.urlBackend;

  constructor(private http: HttpClient) { }

  RegistrarVendedor(datos: any) {
    console.log(datos);
    return this.http.post(`${this.urlBase}vendedor`, datos).pipe(
      catchError(error => {
        console.error('Error al registrar el vendedor:', error);
        return throwError(() => error);
      })
    );
  }

  ObtenerVendedores(): Observable<VendedorModel[]> {
    return this.http.get<VendedorModel[]>(`${this.urlBase}vendedor`);
  }

  BuscarVendedor(id: string): Observable<VendedorModel> {
    return this.http.get<VendedorModel>(`${this.urlBase}vendedor/${id}`);
  }

  EliminarVendedor(id: string): Observable<any> {
    return this.http.delete<any>(`${this.urlBase}vendedor/${id}`);
  }

  EditarVendedor(id: string, datos: any): Observable<any> {
    return this.http.put<any>(`${this.urlBase}vendedor/${id}`, datos);
  }
}
