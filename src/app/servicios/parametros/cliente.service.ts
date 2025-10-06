import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfiguracionRutasBackend } from '../../config/configuracion.rutas.backend';
import { catchError, Observable, throwError } from 'rxjs';
import { ClienteModel } from '../../modelos/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  urlBase: string = ConfiguracionRutasBackend.urlBackend;

  constructor(private http: HttpClient ) { }
  RegistrarCliente(datos: any) {
    console.log(datos);
    return this.http.post(`${this.urlBase}cliente`, datos).pipe(
      catchError(error => {
                // Mostrar detalles del error en consola
                console.error('Error al registrar el cliente:', error);
                return throwError(() => new Error('Hubo un error al registrar el cliente.'));
              })
            );
  }
  // Método para obtener todos los clientes
  ObtenerClientes(): Observable<ClienteModel[]> {
    return this.http.get<ClienteModel[]>(`${this.urlBase}cliente`);
  }

  BuscarCliente(id: number): Observable<ClienteModel>{
    return this.http.get<ClienteModel>(`${this.urlBase}cliente/${id}`);
  }

  EliminarCliente(id: number): Observable<any>{
    return this.http.delete<any>(`${this.urlBase}cliente/${id}`);
  }

  EditarCliente(id: number, datos: any): Observable<any>{
    return this.http.put<any>(`${this.urlBase}cliente/${id}`, datos);
  }
  
}