import { Component } from '@angular/core';
import { GastoModel } from '../../../../modelos/gasto.model';
import { ConfiguracionPaginacion } from '../../../../config/configuracion.paginacion';
import { GastoService } from '../../../../servicios/parametros/gasto.service';

@Component({
  selector: 'app-listar-gasto',
  templateUrl: './listar-gasto.component.html',
  styleUrl: './listar-gasto.component.css'
})
export class ListarGastoComponent {
    gastos: GastoModel[] = [];
    gastosFiltrados: GastoModel[] = [];
    searchQuery: string = '';
    pag = 1;
    total = 0;
    totalItems = 0;
    registrosPorPagina = ConfiguracionPaginacion.registrosPorPagina;

    constructor(
      private servicioGasto: GastoService
    ) {}

     ngOnInit() {
       this.obtenerGastos();
     }

   obtenerGastos() {
     this.servicioGasto.ObtenerGastos().subscribe({
       next: (respuesta: GastoModel[]) => {
         this.gastos = respuesta;
         this.gastosFiltrados = [...this.gastos];
         this.totalItems = this.gastosFiltrados.length;
       },
       error: () => {
         alert('Error al obtener los gastos');
       }
     });
   }

     filtrarGasto(): void {
     const query = this.searchQuery?.toLowerCase().trim() || '';
 
     if (!query) {
       this.gastosFiltrados = [...this.gastos];
     } else {
       this.gastosFiltrados = this.gastos.filter(p =>
         p.id?.toString().toLowerCase().includes(query) ||
         p.Concepto?.toLowerCase().includes(query) ||
         p.Descripcion?.toLowerCase().includes(query)
       );
     }
 
     this.totalItems = this.gastosFiltrados.length;
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
