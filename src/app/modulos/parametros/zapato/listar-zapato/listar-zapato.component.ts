import { Component } from '@angular/core';
import { ZapatoModel } from '../../../../modelos/zapato.model';
import { ConfiguracionPaginacion } from '../../../../config/configuracion.paginacion';
import { ProveedorModel } from '../../../../modelos/proveedor.model';
import { ZapatoService } from '../../../../servicios/parametros/zapato.service';
import { ProveedorService } from '../../../../servicios/parametros/proveedor.service'; // Necesitas importar el servicio de proveedores

@Component({
  selector: 'app-listar-zapato',
  templateUrl: './listar-zapato.component.html',
  styleUrl: './listar-zapato.component.css'
})
export class ListarZapatoComponent {
  zapatos: ZapatoModel[] = [];
  zapatosFiltrados: ZapatoModel[] = [];
  searchQuery: string = '';
  pag = 1;
  totalItems = 0;
  registrosPorPagina = ConfiguracionPaginacion.registrosPorPagina;
  proveedores: ProveedorModel[] = [];

  constructor(
      private servicioZapato: ZapatoService,
      private servicioProveedor: ProveedorService // Inyectar el servicio de proveedores
  ) {
  }
  
  ngOnInit() {
    this.obtenerProveedores();
    this.obtenerZapatos();
  }
  obtenerZapatos() {
    this.servicioZapato.ObtenerZapatos().subscribe({
      next: (respuesta: ZapatoModel[]) => {
        this.zapatos = respuesta;
        this.zapatosFiltrados = [...this.zapatos];
        this.totalItems = this.zapatos.length;
      },
      error: (err) => {
        alert("Error al obtener los zapatos");
      }
    });
  }

  obtenerProveedores() {
    this.servicioProveedor.ObtenerProveedores().subscribe({
      next: (respuesta: ProveedorModel[]) => {
        this.proveedores = respuesta;
      },
      error: (err) => {
        alert("Error al obtener los proveedores");
        console.error(err);
      }
    });
  }

  /**
   * Obtiene el nombre del proveedor por su ID para mostrar en la tabla
   */
  obtenerNombreProveedor(proveedorId: number): string {
    const proveedor = this.proveedores.find(p => p.id === proveedorId);
    return proveedor ? (proveedor.Nombre ?? 'Sin nombre') : 'N/A';
  }
  
  filtrarZapato(): void {
    const query = this.searchQuery?.toLowerCase().trim() || '';
  
    if (!query) {
      this.zapatosFiltrados = [...this.zapatos];
    } else {
      this.zapatosFiltrados = this.zapatos.filter(zapato => {
        const nombreProveedor = zapato.proveedorId !== undefined
          ? this.obtenerNombreProveedor(zapato.proveedorId).toLowerCase()
          : '';
        return zapato.id?.toString().toLowerCase().includes(query) ||
               zapato.Descripcion?.toLowerCase().includes(query) ||
               zapato.Categoria?.toLowerCase().includes(query) ||
               zapato.Color?.toLowerCase().includes(query) ||
               zapato.Referencia?.toLowerCase().includes(query) ||
               nombreProveedor.includes(query) ||
               String(zapato.proveedorId).includes(query);
      });
    }
  
    this.totalItems = this.zapatosFiltrados.length;
    this.pag = 1;
  }
}