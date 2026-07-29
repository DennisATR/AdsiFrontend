import { Injectable } from '@angular/core';
import { ConfiguracionRutasBackend } from '../../config/configuracion.rutas.backend';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DialogService } from '../dialog.service';

export interface ImpresionPendiente {
  id: number;
  tipo: 'factura' | 'cierre';
  lugarImpresion: string;
  fecha: number;
}

const STORAGE_KEY_PENDIENTES = 'impresiones_pendientes';

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  urlBase: string = ConfiguracionRutasBackend.urlBackend;
  urlAgenteLocal: string = 'http://localhost:4000/print';

  private estaProcesando: boolean = false;

  constructor(
    private http: HttpClient,
    private dialogService: DialogService
  ) {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.procesarPendientes());
    }
    // Reintentar periódicamente impresiones pendientes cada 8 segundos
    setInterval(() => {
      this.procesarPendientes();
    }, 8000);
  }

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

  /**
   * Agrega un trabajo de impresión a la cola de pendientes en localStorage.
   */
  agregarAPendientes(id: number, tipo: 'factura' | 'cierre', lugarImpresion: string = 'cliente'): void {
    const pendientes = this.obtenerPendientes();
    const existe = pendientes.some(p => p.id === id && p.tipo === tipo);
    if (!existe) {
      pendientes.push({ id, tipo, lugarImpresion, fecha: Date.now() });
      localStorage.setItem(STORAGE_KEY_PENDIENTES, JSON.stringify(pendientes));
      console.log(`📌 Agregado a impresiones pendientes: ${tipo} #${id}`);
    }
  }

  /**
   * Obtiene la lista actual de impresiones pendientes.
   */
  obtenerPendientes(): ImpresionPendiente[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PENDIENTES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Elimina un registro de la cola de pendientes.
   */
  eliminarPendiente(id: number, tipo: 'factura' | 'cierre'): void {
    const pendientes = this.obtenerPendientes().filter(p => !(p.id === id && p.tipo === tipo));
    localStorage.setItem(STORAGE_KEY_PENDIENTES, JSON.stringify(pendientes));
  }

  /**
   * Recorre y procesa las impresiones pendientes.
   */
  async procesarPendientes(): Promise<void> {
    if (this.estaProcesando) return;

    const pendientes = this.obtenerPendientes();
    if (pendientes.length === 0) return;

    this.estaProcesando = true;

    for (const item of pendientes) {
      try {
        if (item.lugarImpresion === 'cliente') {
          const bufferRes = await this.obtenerBufferGenerico(item.id, item.tipo);
          if (bufferRes && bufferRes.buffer) {
            await new Promise<void>((resolve, reject) => {
              this.imprimirLocal(bufferRes.buffer).subscribe({
                next: () => {
                  this.eliminarPendiente(item.id, item.tipo);
                  this.dialogService.mostrar(
                    `Se ha impreso automáticamente la ${item.tipo === 'factura' ? 'Factura' : 'Tirilla'} #${item.id} tras detectarse conexión con la impresora.`,
                    'info'
                  );
                  resolve();
                },
                error: (err) => reject(err)
              });
            });
          }
        } else if (item.lugarImpresion === 'servidor') {
          await new Promise<void>((resolve, reject) => {
            const url = item.tipo === 'factura'
              ? `${this.urlBase}factura/${item.id}/imprimir-servidor`
              : `${this.urlBase}cierre-caja/${item.id}/imprimir-servidor`;

            this.http.post(url, {}).subscribe({
              next: () => {
                this.eliminarPendiente(item.id, item.tipo);
                this.dialogService.mostrar(
                  `Se ha impreso en el servidor la ${item.tipo === 'factura' ? 'Factura' : 'Tirilla'} #${item.id}.`,
                  'info'
                );
                resolve();
              },
              error: (err) => reject(err)
            });
          });
        }
      } catch (err) {
        console.warn(`Impresora no responde aún (${item.tipo} #${item.id}). Reintentando luego...`);
        break;
      }
    }

    this.estaProcesando = false;
  }

  private obtenerBufferGenerico(id: number, tipo: 'factura' | 'cierre'): Promise<{buffer: string} | null> {
    return new Promise((resolve) => {
      const obs = tipo === 'factura' ? this.obtenerBufferFactura(id) : this.obtenerBufferCierreCaja(id);
      obs.subscribe({
        next: (res) => resolve(res),
        error: () => resolve(null)
      });
    });
  }
}
