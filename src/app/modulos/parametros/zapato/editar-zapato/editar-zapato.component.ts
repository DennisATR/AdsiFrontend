import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfiguracionRutasBackend } from '../../../../config/configuracion.rutas.backend';
import { ZapatoModel } from '../../../../modelos/zapato.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ZapatoService } from '../../../../servicios/parametros/zapato.service';
import { ProveedorService } from '../../../../servicios/parametros/proveedor.service';
import { ProveedorModel } from '../../../../modelos/proveedor.model';

@Component({
  selector: 'app-editar-zapato',
  templateUrl: './editar-zapato.component.html',
  styleUrl: './editar-zapato.component.css'
})
export class EditarZapatoComponent implements OnInit {
  BASE_URL: String = ConfiguracionRutasBackend.urlBackend;
  recordId: string = "";
  fgValidador!: FormGroup;
  
  // Propiedades para el componente de búsqueda de proveedor
  proveedores: ProveedorModel[] = [];
  proveedorSearchQuery: string = '';
  proveedoresFiltrados: ProveedorModel[] = [];
  proveedorSeleccionado: ProveedorModel | null = null;
  showProveedorDropdown: boolean = false;
  selectedProveedorIndex: number = -1;

  referenciaValue: string = "";

  constructor(
    private fb: FormBuilder,
    private servicio: ZapatoService,
    private servicioProveedor: ProveedorService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.recordId = this.route.snapshot.params["id"];
    this.ConstruirFormulario();
  }

  ngOnInit(): void {
    this.obtenerProveedores();
    this.BuscarRegistro();
  }

  ConstruirFormulario() {
    this.fgValidador = this.fb.group({
      descripcion: ['', [Validators.required]],
      categoria: ['', [Validators.required]],
      color: ['', [Validators.required]],
      talla: ['', [Validators.required]],
      referencia: ['', [Validators.required]],
      precioVentaMax: ['', [Validators.required]],
      precioVentaMin: ['', [Validators.required]],
      cantidad: ['', [Validators.required]],
      proveedorId: ['', [Validators.required]]
    });
  }

  BuscarRegistro() {
    this.servicio.BuscarZapato(this.recordId).subscribe({
      next: (datos: ZapatoModel) => {
        this.fgValidador.patchValue({
          descripcion: datos.Descripcion,
          categoria: datos.Categoria,
          color: datos.Color,
          talla: datos.Talla,
          precioVentaMax: datos.PrecioVentaMax,
          precioVentaMin: datos.PrecioVentaMin,
          cantidad: datos.Cantidad,
          proveedorId: datos.proveedorId,
        });

        // Configurar el proveedor seleccionado para el componente de búsqueda
        const proveedorEncontrado = this.proveedores.find(p => p.id === datos.proveedorId);
        if (proveedorEncontrado) {
          this.proveedorSeleccionado = proveedorEncontrado;
          this.proveedorSearchQuery = `${proveedorEncontrado.Nombre} (ID: ${proveedorEncontrado.id})`;
        }

        // Obtener la referencia del zapato
        this.ObtenerReferencia();
      },
      error: (err) => {
        alert("El registro no existe.");
        this.router.navigate(['/parametros/zapato/crear-zapato']);
      }
    });
  }

  ActualizarRegistro() {
    if (this.fgValidador.invalid) {
      alert("Formulario inválido. Por favor complete todos los campos correctamente.");
      return;
    }

    let datos = {
      Descripcion: this.fgValidador.controls['descripcion'].value,
      Categoria: this.fgValidador.controls['categoria'].value,
      Color: this.fgValidador.controls['color'].value,
      Talla: this.fgValidador.controls['talla'].value,
      PrecioVentaMax: this.fgValidador.controls['precioVentaMax'].value,
      PrecioVentaMin: this.fgValidador.controls['precioVentaMin'].value,
      Cantidad: this.fgValidador.controls['cantidad'].value,
      proveedorId: parseInt(this.fgValidador.controls['proveedorId'].value),
      Referencia: this.fgValidador.controls['referencia'].value,
      Ganancia: 0,
      Fecha: new Date(),
    };

    this.servicio.EditarZapato(this.recordId, datos).subscribe({
      next: (data: any) => {
        alert("Información actualizada correctamente");
        this.router.navigate(['/parametros/zapato/crear-zapato']);
      },
      error: (err: any) => {
        alert("Ha ocurrido un error al actualizar");
        console.error('Error:', err);
      }
    });
  }

  ObtenerReferencia() {
    this.servicio.ObtenerReferencia(this.recordId).subscribe({
      next: (datos) => {
        this.referenciaValue = datos.referencia;
        this.fgValidador.patchValue({ referencia: datos.referencia })
      },
      error: (err) => {
        this.referenciaValue = "No se pudo obtener la referencia";
        console.error("Error al obtener la referencia:", err);
      }
    });
  }

  obtenerProveedores() {
    this.servicioProveedor.ObtenerProveedores().subscribe({
      next: (respuesta: ProveedorModel[]) => {
        this.proveedores = respuesta;
        this.proveedoresFiltrados = [...this.proveedores];
      },
      error: (err) => {
        alert("Error al obtener los proveedores");
      }
    });
  }

  // Métodos para el componente de búsqueda de proveedor
  onProveedorSearchInput(): void {
    const query = this.proveedorSearchQuery.toLowerCase().trim();
    
    if (!query) {
      this.proveedoresFiltrados = [...this.proveedores];
    } else {
      this.proveedoresFiltrados = this.proveedores.filter(proveedor => {
        return proveedor.Nombre?.toLowerCase().includes(query) ||
               proveedor.id?.toString().includes(query);
      });
    }
    
    this.showProveedorDropdown = true;
    this.selectedProveedorIndex = -1;
  }

  onProveedorFocus(): void {
    this.showProveedorDropdown = true;
    this.proveedoresFiltrados = [...this.proveedores];
    this.selectedProveedorIndex = -1;
  }

  onProveedorBlur(): void {
    setTimeout(() => {
      this.showProveedorDropdown = false;
      this.selectedProveedorIndex = -1;
    }, 200);
  }

  seleccionarProveedor(proveedor: ProveedorModel): void {
    this.proveedorSeleccionado = proveedor;
    this.proveedorSearchQuery = `${proveedor.Nombre} (ID: ${proveedor.id})`;
    this.fgValidador.patchValue({ proveedorId: proveedor.id });
    this.showProveedorDropdown = false;
    this.selectedProveedorIndex = -1;
  }

  limpiarProveedorSeleccionado(): void {
    this.proveedorSeleccionado = null;
    this.proveedorSearchQuery = '';
    this.fgValidador.patchValue({ proveedorId: '' });
    this.proveedoresFiltrados = [...this.proveedores];
    this.selectedProveedorIndex = -1;
  }

  onProveedorKeydown(event: KeyboardEvent): void {
    if (!this.showProveedorDropdown) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedProveedorIndex = Math.min(
          this.selectedProveedorIndex + 1,
          this.proveedoresFiltrados.length - 1
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedProveedorIndex = Math.max(this.selectedProveedorIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.selectedProveedorIndex >= 0 && this.selectedProveedorIndex < this.proveedoresFiltrados.length) {
          this.seleccionarProveedor(this.proveedoresFiltrados[this.selectedProveedorIndex]);
        }
        break;
      case 'Escape':
        this.showProveedorDropdown = false;
        break;
    }
  }

  onProveedorOptionHover(index: number): void {
    this.selectedProveedorIndex = index;
  }

  // Métodos para validaciones
  get descripcion() { return this.fgValidador.get('descripcion'); }
  get categoria() { return this.fgValidador.get('categoria'); }
  get color() { return this.fgValidador.get('color'); }
  get talla() { return this.fgValidador.get('talla'); }
  get precioVentaMax() { return this.fgValidador.get('precioVentaMax'); }
  get precioVentaMin() { return this.fgValidador.get('precioVentaMin'); }
  get cantidad() { return this.fgValidador.get('cantidad'); }
  get proveedorId() { return this.fgValidador.get('proveedorId'); }
  get referencia() { return this.fgValidador.get('referencia'); }
}