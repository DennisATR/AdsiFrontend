import { Component } from '@angular/core';
import { EntregaModel } from '../../../../modelos/entrega.model';
import { ConfiguracionPaginacion } from '../../../../config/configuracion.paginacion';
import { EntregaService } from '../../../../servicios/parametros/entrega.service';

@Component({
  selector: 'app-listar-entrega',
  templateUrl: './listar-entrega.component.html',
  styleUrl: './listar-entrega.component.css'
})
export class ListarEntregaComponent {
    entregas: EntregaModel[] = [];
    entregasFiltradas: EntregaModel[] = [];
    searchQuery: string = '';
    pag = 1;
    total = 0;
    totalItems = 0;
    registrosPorPagina = ConfiguracionPaginacion.registrosPorPagina;

    constructor(
      private servicioEntrega: EntregaService
    ) {}

    ngOnInit() {
      this.obtenerEntregas();
    }

    obtenerEntregas() {
      this.servicioEntrega.ObtenerEntregas().subscribe({
        next: (respuesta: EntregaModel[]) => {
          this.entregas = respuesta;
          this.entregasFiltradas = [...this.entregas];
          this.totalItems = this.entregasFiltradas.length;
        },
        error: () => {
          alert('Error al obtener las entregas');
        }
      });
    }

    filtrarEntrega(): void {
      const query = this.searchQuery?.toLowerCase().trim() || '';
  
      if (!query) {
        this.entregasFiltradas = [...this.entregas];
      } else {
        this.entregasFiltradas = this.entregas.filter(e =>
          e.id?.toString().toLowerCase().includes(query) ||
          e.Remitente?.toLowerCase().includes(query) ||
          e.EmpresaTrans?.toLowerCase().includes(query) ||
          e.Observacion?.toLowerCase().includes(query)
        );
      }
  
      this.totalItems = this.entregasFiltradas.length;
      this.pag = 1;
    }

    formatearFecha(fecha?: any): string {
      if (!fecha) return '';
      const d = new Date(fecha);
      d.setMinutes(d.getMinutes() + d.getTimezoneOffset()); 
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${day}/${month}/${year}`;
    }
}