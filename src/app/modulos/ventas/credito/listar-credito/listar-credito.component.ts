import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CreditoDetalleModel } from '../../../../modelos/creditoDetalle.model';
import { CreditoModel } from '../../../../modelos/credito.model';
import { ConfiguracionPaginacion } from '../../../../config/configuracion.paginacion';
import { CreditoService } from '../../../../servicios/ventas/credito.service';
import { forkJoin, catchError, of } from 'rxjs';

@Component({
  selector: 'app-listar-credito',
  templateUrl: './listar-credito.component.html',
  styleUrl: './listar-credito.component.css'
})
export class ListarCreditoComponent implements OnInit {
  // Datos
  creditosDetalle: CreditoDetalleModel[] = [];
  creditosDetalleFiltrados: CreditoDetalleModel[] = [];
  
  // Modal
  mostrarModal: boolean = false;
  creditoSeleccionado: CreditoDetalleModel | null = null;
  
  // Búsqueda
  searchQuery: string = '';
  
  pag = 1;
  registrosPorPagina = ConfiguracionPaginacion.registrosPorPagina;

  constructor(private servicioCredito: CreditoService) {}

  ngOnInit(): void {
    this.CargaInicial();
  }

  CargaInicial() {
    this.CargarCreditosConDetalle();
  }

  CargarCreditosConDetalle() {
    this.servicioCredito.ObtenerCreditos().subscribe({
      next: (creditos: CreditoModel[]) => {
        console.log('Créditos cargados:', creditos);
        
        if (creditos.length === 0) {
          this.creditosDetalle = [];
          this.creditosDetalleFiltrados = [];
          return;
        }

        const detalles$ = creditos.map(credito => 
          this.servicioCredito.ObtenerCreditoDetalle(credito.id!).pipe(
            catchError((err: any) => {
              console.error(`Error al obtener detalle del crédito ${credito.id}:`, err);
              return of({
                creditoId: credito.id,
                facturaId: credito.facturaId,
                clienteNombre: 'N/A',
                clienteApellido: 'N/A',
                zapatoDescripcion: 'N/A',
                zapatoTalla: 0,
                zapatoColor: 'N/A',
                valorTotal: 0,
                valorAbonado: 0,
                saldo: 0,
                estado: credito.Estado,
                fechaFactura: undefined
              } as CreditoDetalleModel);
            })
          )
        );

        forkJoin(detalles$).subscribe({
          next: (detalles: any[]) => {
            console.log('Detalles de créditos cargados:', detalles);
            
            // Transformar datos del backend al modelo esperado
            this.creditosDetalle = detalles.map(detalle => ({
              creditoId: detalle.id || detalle.creditoId,
              facturaId: detalle.facturaId || detalle.FacturaId,
              clienteNombre: detalle.clienteNombre || detalle.ClienteNombre || 'N/A',
              clienteApellido: detalle.clienteApellido || detalle.ClienteApellido || 'N/A',
              zapatoDescripcion: detalle.zapatoDescripcion || detalle.ZapatoDescripcion || 'N/A',
              zapatoTalla: detalle.zapatoTalla || detalle.ZapatoTalla || 0,
              zapatoColor: detalle.zapatoColor || detalle.ZapatoColor || 'N/A',
              valorTotal: detalle.valorTotal || detalle.ValorTotal || 0,
              valorAbonado: detalle.valorAbonado || detalle.ValorAbonado || 0,
              saldo: (detalle.saldo || detalle.Saldo || ((detalle.valorTotal || detalle.ValorTotal || 0) - (detalle.valorAbonado || detalle.ValorAbonado || 0))),
              estado: detalle.estado || detalle.Estado || 'N/A',
              fechaFactura: detalle.fechaFactura || detalle.FechaFactura || detalle.FechaLimitePago
            } as CreditoDetalleModel));
            
            this.FiltrarCreditos();
          },
          error: (err: any) => {
            console.error('Error al cargar detalles de créditos:', err);
            alert('Error al cargar los créditos');
          }
        });
      },
      error: (err: any) => {
        console.error('Error al obtener créditos:', err);
        alert('Error al cargar los créditos');
      }
    });
  }

  FiltrarCreditos() {
    const queryLower = this.searchQuery.toLowerCase().trim();

    this.creditosDetalleFiltrados = this.creditosDetalle.filter(credito => {
      if (!queryLower) return true;

      return (
        credito.facturaId?.toString().includes(queryLower) ||
        credito.clienteNombre?.toLowerCase().includes(queryLower) ||
        credito.clienteApellido?.toLowerCase().includes(queryLower) ||
        credito.zapatoDescripcion?.toLowerCase().includes(queryLower)
      );
    });

    this.pag = 1; // Resetear a primera página
  }

  AbrirModalPago(credito: CreditoDetalleModel) {
    this.creditoSeleccionado = credito;
    this.mostrarModal = true;
  }

  CerrarModal() {
    this.mostrarModal = false;
    this.creditoSeleccionado = null;
  }

  PagoRegistrado() {
    this.CerrarModal();
    this.CargaInicial(); // Recargar datos
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
