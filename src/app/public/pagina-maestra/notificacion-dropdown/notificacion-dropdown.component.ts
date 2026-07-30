import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { NotificacionModel } from '../../../modelos/notificacion.model';
import { NotificacionService } from '../../../servicios/ventas/notificacion.service';

@Component({
  selector: 'app-notificacion-dropdown',
  templateUrl: './notificacion-dropdown.component.html',
  styleUrls: ['./notificacion-dropdown.component.css']
})
export class NotificacionDropdownComponent implements OnInit, OnChanges {
  @Input() notificaciones: NotificacionModel[] = [];
  @Output() cerrar = new EventEmitter<void>();

  notificacionExpandidaId: number | null = null;
  notificacionesHistorial: NotificacionModel[] = [];
  modoHistorial: boolean = false;
  cargandoHistorial: boolean = false;

  constructor(private notificacionService: NotificacionService) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['notificaciones'] && !this.modoHistorial) {
      // Si estamos en modo pendientes, se actualizan las notificaciones visibles automáticamente
    }
  }

  get notificacionesVisibles(): NotificacionModel[] {
    return this.modoHistorial ? this.notificacionesHistorial : this.notificaciones;
  }

  toggleCard(id?: number) {
    if (!id) return;
    if (this.notificacionExpandidaId === id) {
      this.notificacionExpandidaId = null;
    } else {
      this.notificacionExpandidaId = id;
    }
  }

  isExpandida(id?: number): boolean {
    if (!id) return false;
    return this.notificacionExpandidaId === id;
  }

  aceptar(event: Event, id?: number) {
    event.stopPropagation();
    if (!id) return;
    this.notificacionService.aceptarNotificacion(id).subscribe({
      next: () => {
        if (this.notificacionExpandidaId === id) {
          this.notificacionExpandidaId = null;
        }
        if (this.modoHistorial) {
          this.cargarHistorialHoy();
        }
      },
      error: (err) => {
        console.error('Error al aceptar notificación:', err);
      }
    });
  }

  toggleModoHistorial() {
    if (!this.modoHistorial) {
      this.cargarHistorialHoy();
    } else {
      this.modoHistorial = false;
      this.notificacionExpandidaId = null;
    }
  }

  cargarHistorialHoy() {
    this.cargandoHistorial = true;
    this.notificacionService.obtenerNotificacionesHoy().subscribe({
      next: (data) => {
        this.notificacionesHistorial = data;
        this.modoHistorial = true;
        this.cargandoHistorial = false;
      },
      error: (err) => {
        console.error('Error al cargar historial de hoy:', err);
        this.cargandoHistorial = false;
      }
    });
  }

  formatearFecha(fechaStr?: string): string {
    if (!fechaStr) return '';
    
    // Si la fecha viene en formato "YYYY-MM-DD HH:mm:ss"
    const partes = fechaStr.split(' ');
    if (partes.length === 2) {
      const [fecha, hora] = partes;
      const [year, month, day] = fecha.split('-');
      const [hoursStr, minutesStr] = hora.split(':');
      let hours = parseInt(hoursStr, 10);
      const minutes = minutesStr;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // Formato 12 horas
      return `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`;
    }

    try {
      const d = new Date(fechaStr);
      return isNaN(d.getTime()) ? fechaStr : d.toLocaleString('es-CO');
    } catch {
      return fechaStr;
    }
  }

  cerrarPanel() {
    this.cerrar.emit();
  }
}
