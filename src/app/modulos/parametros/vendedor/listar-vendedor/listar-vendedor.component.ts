import { Component } from '@angular/core';
import { VendedorModel } from '../../../../modelos/vendedor.model';
import { ConfiguracionPaginacion } from '../../../../config/configuracion.paginacion';
import { VendedorService } from '../../../../servicios/parametros/vendedor.service';

@Component({
  selector: 'app-listar-vendedor',
  templateUrl: './listar-vendedor.component.html',
  styleUrl: './listar-vendedor.component.css'
})
export class ListarVendedorComponent {
  vendedoresFiltrados: VendedorModel[] = [];
  searchQuery: string = '';
  pag = 1;
  total = 0;
  vendedores: VendedorModel[] = [];
  totalItems = 0;

  registrosPorPagina = ConfiguracionPaginacion.registrosPorPagina;

  constructor(
    private servicioVendedor: VendedorService
  ) {}

  ngOnInit() {
    this.obtenerVendedores();
  }

  obtenerVendedores(): void {
    this.servicioVendedor.ObtenerVendedores().subscribe({
      next: (respuesta) => {
        this.vendedores = respuesta;
        this.vendedoresFiltrados = [...this.vendedores];
        this.totalItems = this.vendedores.length;
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  filtrarVendedores(): void {
    const query = this.searchQuery?.toLowerCase().trim() || '';

    if (!query) {
      this.vendedoresFiltrados = [...this.vendedores];
    } else {
      this.vendedoresFiltrados = this.vendedores.filter(vendedor => {
        return (
          vendedor.id?.toString().includes(query) ||
          vendedor.Nombre?.toLowerCase().includes(query) ||
          vendedor.Apellido?.toLowerCase().includes(query) ||
          vendedor.Correo?.toLowerCase().includes(query) ||
          String(vendedor.Telefono).includes(query)
        );
      });
    }

    this.totalItems = this.vendedoresFiltrados.length;
    this.pag = 1;
  }
}