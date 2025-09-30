import { Component } from '@angular/core';
import { ConfiguracionRutasBackend } from '../../../../config/configuracion.rutas.backend';
import { ZapatoService } from '../../../../servicios/parametros/zapato.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ZapatoModel } from '../../../../modelos/zapato.model';
import { ProveedorService } from '../../../../servicios/parametros/proveedor.service';
import { ProveedorModel } from '../../../../modelos/proveedor.model';

@Component({
  selector: 'app-eliminar-zapato',
  templateUrl: './eliminar-zapato.component.html',
  styleUrl: './eliminar-zapato.component.css'
})
export class EliminarZapatoComponent {
  BASE_URL: String = ConfiguracionRutasBackend.urlBackend;
  recordId: string = "";
  descripcion: string = "";
  categoria: string = "";
  color: string = "";
  talla: number = 0;
  referencia: string = "";
  precioVentaMax: number = 0;
  precioVentaMin: number = 0;
  cantidad: number = 0;
  proveedorId: number = 0;
  proveedorNombre: string = ""; // Nueva propiedad para almacenar el nombre
  
  constructor(
    private servicio: ZapatoService,
    private router: Router,
    private route: ActivatedRoute,
    private servicioProveedor: ProveedorService
  ) {
    this.recordId = this.route.snapshot.params["id"];
  }

  ngOnInit(): void {
    this.BuscarRegistro();
  }

  BuscarRegistro() {
    this.servicio.BuscarZapato(this.recordId).subscribe({
      next: (datos: ZapatoModel) => {
        this.recordId = datos.id!;
        this.descripcion = datos.Descripcion!;
        this.categoria = datos.Categoria!;
        this.color = datos.Color!;
        this.talla = datos.Talla!;
        this.precioVentaMax = datos.PrecioVentaMax!;
        this.precioVentaMin = datos.PrecioVentaMin!;
        this.cantidad = datos.Cantidad!;
        this.proveedorId = datos.proveedorId!;
        
        // Cargar el nombre del proveedor
        this.CargarProveedor(datos.proveedorId!);
        // Obtener la referencia del zapato
        this.ObtenerReferencia();
      },
      error: (err) => {
        alert("El registro no existe.")
      }
    });
  }

  CargarProveedor(proveedorId: number) {
    this.servicioProveedor.BuscarProveedor(proveedorId).subscribe({
      next: (proveedor: ProveedorModel) => {
        this.proveedorNombre = proveedor.Nombre!;
      },
      error: (err) => {
        this.proveedorNombre = "Proveedor no encontrado";
        console.error("Error al cargar proveedor:", err);
      }
    });
  }

  EliminarRegistro() {
    this.servicio.EliminarZapato(this.recordId).subscribe({
      next: (data: any) => {
        alert("Información eliminada correctamente");
        this.router.navigate(['/parametros/zapato/crear-zapato']);
      },
      error: (err: any) => {
        alert("Ha ocurrido un error");
      }
    });
  }

  ObtenerReferencia() {
    this.servicio.ObtenerReferencia(this.recordId).subscribe({
      next: (datos) => {
        this.referencia = datos.referencia;
      },
      error: (err) => {
        this.referencia = "No se pudo obtener la referencia";
        console.error("Error al obtener la referencia:", err);
      }
    });
  }

}

