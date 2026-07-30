import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ConfiguracionRutasBackend } from '../../config/configuracion.rutas.backend';
import { NotificacionModel } from '../../modelos/notificacion.model';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  urlBase: string = ConfiguracionRutasBackend.urlBackend;

  private notificacionesSubject = new BehaviorSubject<NotificacionModel[]>([]);
  public notificaciones$ = this.notificacionesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.cargarPendientes();
  }

  cargarPendientes(): Observable<NotificacionModel[]> {
    return this.http.get<NotificacionModel[]>(`${this.urlBase}notificacion/pendientes`).pipe(
      tap((notificaciones) => {
        this.notificacionesSubject.next(notificaciones);
      })
    );
  }

  obtenerNotificacionesHoy(): Observable<NotificacionModel[]> {
    return this.http.get<NotificacionModel[]>(`${this.urlBase}notificacion/hoy`);
  }

  verificarExhibicion(zapatoId: string, cantidad: number = 1): Observable<any> {
    return this.http.post<any>(`${this.urlBase}notificacion/verificar-exhibicion`, {
      zapatoId,
      cantidad
    }).pipe(
      tap((res) => {
        if (res && res.esExhibicion) {
          this.cargarPendientes().subscribe();
        }
      })
    );
  }

  aceptarNotificacion(id: number): Observable<any> {
    return this.http.patch<any>(`${this.urlBase}notificacion/${id}/aceptar`, {}).pipe(
      tap(() => {
        this.cargarPendientes().subscribe();
      })
    );
  }
}
