import { Component } from '@angular/core';
import { ConfiguracionPaginacion } from '../../../../config/configuracion.paginacion';
import { ProveedorModel } from '../../../../modelos/proveedor.model';
import { ProveedorService } from '../../../../servicios/parametros/proveedor.service';

@Component({
  selector: 'app-listar-proveedor',
  templateUrl: './listar-proveedor.component.html',
  styleUrl: './listar-proveedor.component.css'
})
export class ListarProveedorComponent {
    proveedores: ProveedorModel[] = [];
    proveedoresFiltrados: ProveedorModel[] = [];
    searchQuery: string = '';
    pag = 1;
    total = 0;
    totalItems = 0;
    registrosPorPagina = ConfiguracionPaginacion.registrosPorPagina;

    constructor(
      private servicioProveedor: ProveedorService
    ) {}
  
    ngOnInit() {
      this.obtenerProveedores();
    }

  obtenerProveedores() {
    this.servicioProveedor.ObtenerProveedores().subscribe({
      next: (respuesta: ProveedorModel[]) => {
        this.proveedores = respuesta;
        this.proveedoresFiltrados = [...this.proveedores];
        this.totalItems = this.proveedoresFiltrados.length;
      },
      error: () => {
        alert('Error al obtener los proveedores');
      }
    });
  }

    filtrarProveedor(): void {
    const query = this.searchQuery?.toLowerCase().trim() || '';

    if (!query) {
      this.proveedoresFiltrados = [...this.proveedores];
    } else {
      this.proveedoresFiltrados = this.proveedores.filter(p =>
        p.Nombre?.toLowerCase().includes(query) ||
        p.Empresa?.toLowerCase().includes(query) ||
        p.Correo?.toLowerCase().includes(query) ||
        p.Ciudad?.toLowerCase().includes(query) ||
        p.Telefono?.toLowerCase().includes(query) ||
        p.NIT?.toLowerCase().includes(query)
      );
    }

    this.totalItems = this.proveedoresFiltrados.length;
    this.pag = 1;
  }
    

}
