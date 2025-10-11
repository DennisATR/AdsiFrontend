import { Component, OnInit } from '@angular/core';
import { ClienteModel } from '../../../../modelos/cliente.model';
import { ConfiguracionPaginacion } from '../../../../config/configuracion.paginacion';
import { ClienteService } from '../../../../servicios/parametros/cliente.service';

@Component({
  selector: 'app-listar-cliente',
  templateUrl: './listar-cliente.component.html',
  styleUrl: './listar-cliente.component.css',
})
export class ListarClienteComponent implements OnInit {
  clientes: ClienteModel[] = [];
  clientesFiltrados: ClienteModel[] = [];
  searchQuery: string = '';
  pag = 1;
  totalItems = 0;
  registrosPorPagina = ConfiguracionPaginacion.registrosPorPagina;

  constructor(private servicio: ClienteService) { }

  ngOnInit(): void {
    this.obtenerClientes();
  }

  obtenerClientes(): void {
    this.servicio.ObtenerClientes().subscribe({
      next: (data: ClienteModel[]) => {
        this.clientes = data;
        this.clientesFiltrados = [...this.clientes];
        this.totalItems = this.clientesFiltrados.length;
      },
      error: (err) => {
        console.error('Error al obtener clientes:', err);
        alert('Error al cargar los clientes');
      }
    });
  }

  filtrarCliente(): void {
    const query = this.searchQuery.toLowerCase().trim();

    if (!query) {
      this.clientesFiltrados = [...this.clientes];
    } else {
      this.clientesFiltrados = this.clientes.filter(cliente => {
        return (
          cliente.Nombre?.toLowerCase().includes(query) ||
          cliente.Ciudad?.toLowerCase().includes(query) ||
          cliente.Correo?.toLowerCase().includes(query) ||
          cliente.Telefono?.toLowerCase().includes(query) ||
          cliente.id?.toString().includes(query)
        );
      });
    }

    this.totalItems = this.clientesFiltrados.length;
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