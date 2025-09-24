import { Injectable } from '@angular/core';
import { ConfiguracionRutasBackend } from '../../config/configuracion.rutas.backend';
import { HttpClient } from '@angular/common/http';
import { ProveedorModel } from '../../modelos/proveedor.model';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  urlBase: string = ConfiguracionRutasBackend.urlBackend;

  constructor(private http: HttpClient ) { }
  RegistrarProveedor(datos: any) {
    console.log(datos);
    return this.http.post(`${this.urlBase}proveedor`, datos).pipe(
      catchError(error => {
                // Mostrar detalles del error en consola
                console.error('Error al registrar el proveedor:', error);
                return throwError(() => new Error('Hubo un error al registrar el proveedor.'));
              })
            );
  }
  // Método para obtener todos los proveedores
  ObtenerProveedores(): Observable<ProveedorModel[]> {
    return this.http.get<ProveedorModel[]>(`${this.urlBase}proveedor`);
  }

  BuscarProveedor(id: number): Observable<ProveedorModel>{
    return this.http.get<ProveedorModel>(`${this.urlBase}proveedor/${id}`);
  }

  EliminarProveedor(id: number): Observable<any>{
    return this.http.delete<any>(`${this.urlBase}proveedor/${id}`);
  }
}
