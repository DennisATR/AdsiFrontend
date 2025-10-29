import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfiguracionRutasBackend } from '../../../../config/configuracion.rutas.backend';
import { ZapatoModel } from '../../../../modelos/zapato.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ZapatoService } from '../../../../servicios/parametros/zapato.service';
import { ProveedorService } from '../../../../servicios/parametros/proveedor.service';
import { ProveedorModel } from '../../../../modelos/proveedor.model';
import { ConfiguracionListas } from '../../../../config/configuracion.listas';


@Component({
  selector: 'app-editar-zapato',
  templateUrl: './editar-zapato.component.html',
  styleUrl: './editar-zapato.component.css'
})
export class EditarZapatoComponent implements OnInit {
  BASE_URL: String = ConfiguracionRutasBackend.urlBackend;
  recordId: string = "";
  fgValidador!: FormGroup;

  proveedores: ProveedorModel[] = [];
  proveedoresNombres: string[] = [];
  referenciaValue: string = "";
  colores = ConfiguracionListas.colores
  categorias = ConfiguracionListas.categoriasZapatos

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
      proveedorId: ['', [Validators.required]],
      proveedorNombre: ['', [Validators.required]]
    });
  }

  obtenerProveedores() {
    this.servicioProveedor.ObtenerProveedores().subscribe({
      next: (respuesta: ProveedorModel[]) => {
        this.proveedores = respuesta;
        this.proveedoresNombres = this.proveedores.map(
          p => `${p.Nombre} (ID: ${p.id})`
        );
        this.BuscarRegistro();
      },
      error: (err) => {
        alert('Error al obtener los proveedores');
        console.error('Error:', err);
      }
    });
  }

  BuscarRegistro() {
    this.servicio.BuscarZapato(this.recordId).subscribe({
      next: (datos: ZapatoModel) => {
        // Buscar el nombre del proveedor para mostrar en el input
        const proveedorEncontrado = this.proveedores.find(p => p.id === datos.proveedorId);
        const proveedorNombreCompleto = proveedorEncontrado
          ? `${proveedorEncontrado.Nombre} (ID: ${proveedorEncontrado.id})`
          : '';

        this.fgValidador.patchValue({
          descripcion: datos.Descripcion,
          categoria: datos.Categoria,
          color: datos.Color,
          talla: datos.Talla,
          precioVentaMax: datos.PrecioVentaMax,
          precioVentaMin: datos.PrecioVentaMin,
          cantidad: datos.Cantidad,
          proveedorId: datos.proveedorId,
          proveedorNombre: proveedorNombreCompleto
        });

        // Obtener la referencia del zapato
        this.ObtenerReferencia();
      },
      error: (err) => {
        alert("El registro no existe.");
        this.router.navigate(['/parametros/zapato/crear-zapato']);
      }
    });
  }

  onProveedorSeleccionado(nombreCompleto: string): void {
    const match = nombreCompleto.match(/\(ID:\s*(\d+)\)/);
    if (match) {
      const proveedorId = match[1];
      this.fgValidador.patchValue({ proveedorId: proveedorId });
    }
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
      Fecha: new Date(),
    };

    this.servicio.EditarZapato(this.recordId, datos).subscribe({
      next: (data: any) => {
        alert("Información actualizada correctamente");
        this.router.navigate(['/parametros/zapato/crear-zapato']);
      },
      error: (err: any) => {
        if (err.error && err.error.error && err.error.error.message) {
          alert(err.error.error.message);
        } else {
          alert('Ocurrió un error inesperado.');
        }
        console.error('Error:', err);
      }
    });
  }

  ObtenerReferencia() {
    this.servicio.ObtenerReferencia(this.recordId).subscribe({
      next: (datos) => {
        this.referenciaValue = datos.referencia;
        this.fgValidador.patchValue({ referencia: datos.referencia });
      },
      error: (err) => {
        this.referenciaValue = "No se pudo obtener la referencia";
        console.error("Error al obtener la referencia:", err);
      }
    });
  }

  // Getters para validaciones
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