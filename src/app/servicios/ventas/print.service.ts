import { Injectable } from '@angular/core';
import { ConfiguracionRutasBackend } from '../../config/configuracion.rutas.backend';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  urlBase: string = ConfiguracionRutasBackend.urlBackend;
  urlAgenteLocal: string = 'http://localhost:4000/print';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene el buffer ESC/POS de una factura en formato base64 desde el backend.
   */
  obtenerBufferFactura(facturaId: number): Observable<{buffer: string}> {
    return this.http.get<{buffer: string}>(`${this.urlBase}factura/${facturaId}/imprimir`);
  }

  /**
   * Obtiene el buffer ESC/POS de la tirilla de cierre de caja en formato base64 desde el backend.
   */
  obtenerBufferCierreCaja(cierreCajaId: number): Observable<{buffer: string}> {
    return this.http.get<{buffer: string}>(`${this.urlBase}cierre-caja/${cierreCajaId}/imprimir`);
  }

  /**
   * Envía el buffer base64 al agente local para imprimir en la PC del cliente.
   */
  imprimirLocal(bufferBase64: string): Observable<any> {
    return this.http.post(this.urlAgenteLocal, { buffer: bufferBase64 });
  }
}
