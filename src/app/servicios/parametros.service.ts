import { Injectable } from '@angular/core';
import { ConfiguracionRutasBackend } from '../config/configuracion.rutas.backend';
import { HttpClient } from '@angular/common/http';
import { ZapatoModel } from '../modelos/zapato.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParametrosService {
  urlBase: string = ConfiguracionRutasBackend.urlBackend;

  constructor(private http: HttpClient ) { }

  RegistrarZapato(datos: any) {
    console.log(datos);
    return this.http.post(`${this.urlBase}zapato`, datos);
  }

  // Método para obtener todos los usuarios
  ObtenerZapatos(): Observable<ZapatoModel[]> {
  return this.http.get<ZapatoModel[]>(`${this.urlBase}zapato`);
  }
}
