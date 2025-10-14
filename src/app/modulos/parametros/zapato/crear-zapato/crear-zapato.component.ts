import { Component, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ZapatoModel } from '../../../../modelos/zapato.model';
import { ConfiguracionPaginacion } from '../../../../config/configuracion.paginacion';
import { ProveedorModel } from '../../../../modelos/proveedor.model';
import { ListarZapatoComponent } from '../listar-zapato/listar-zapato.component';
import { ZapatoService } from '../../../../servicios/parametros/zapato.service';
import { ProveedorService } from '../../../../servicios/parametros/proveedor.service';
import { ConfiguracionListas } from '../../../../config/configuracion.listas';
import { MultiSelectDirective } from '../../../../directivas/multi-select.directive';

@Component({
  selector: 'app-crear-zapato',
  templateUrl: './crear-zapato.component.html',
  styleUrl: './crear-zapato.component.css'
})
export class CrearZapatoComponent implements OnInit {
  @ViewChild(ListarZapatoComponent) listarZapatoComponent!: ListarZapatoComponent;
  @ViewChild(MultiSelectDirective) colorDirective!: MultiSelectDirective;

  fGroup: FormGroup = new FormGroup({});
  zapatos: ZapatoModel[] = [];
  zapatosFiltrados: ZapatoModel[] = [];
  proveedores: ProveedorModel[] = [];
  proveedoresNombres: string[] = [];
  colores = ConfiguracionListas.colores
  searchQuery: string = '';
  pag = 1;
  total = 0;
  totalItems = 0;
  registrosPorPagina = ConfiguracionPaginacion.registrosPorPagina;
  codigoBarraHabilitado: boolean = false;
  categoriasComunes = ConfiguracionListas.categoriasZapatos

  constructor(
    private fb: FormBuilder,
    private servicioZapato: ZapatoService,
    private servicioProveedor: ProveedorService
  ) { }

  ngOnInit() {
    this.ConstruirFormulario();
    this.obtenerProveedores();
    this.fGroup.get('CodigoBarra')?.disable();
  }

  get ObtenerFormGroup() {
    return this.fGroup.controls;
  }

  ConstruirFormulario() {
    this.fGroup = this.fb.group({
      CodigoBarra: ['', Validators.required],
      Descripcion: ['', Validators.required],
      Categoria: ['', Validators.required],
      Talla: ['', Validators.required],
      Color: ['', Validators.required],
      Ganancia: ['', Validators.required],
      Referencia: ['', Validators.required],
      PrecioVentaMax: ['', Validators.required],
      PrecioVentaMin: ['', Validators.required],
      Cantidad: ['', Validators.required],
      Fecha: ['', Validators.required],
      proveedorId: ['', Validators.required],
      ProveedorNombre: ['', Validators.required],
    });
  }

  RegistrarZapato() {
    let campos = this.ObtenerFormGroup;
    let datos = {
      id: campos['CodigoBarra'].value,
      Descripcion: campos['Descripcion'].value,
      Categoria: campos['Categoria'].value,
      Talla: campos['Talla'].value,
      Color: campos['Color'].value,
      Ganancia: 0,
      Referencia: campos['Referencia'].value,
      PrecioVentaMax: campos['PrecioVentaMax'].value,
      PrecioVentaMin: campos['PrecioVentaMin'].value,
      Cantidad: campos['Cantidad'].value,
      Fecha: new Date().toISOString(),
      proveedorId: parseInt(campos['proveedorId'].value),
    };

    console.log(datos);

    this.servicioZapato.RegistrarZapato(datos).subscribe({
      next: (respuesta: ZapatoModel) => {
        alert('Zapato registrado correctamente');
        this.limpiarFormulario();
        if (this.listarZapatoComponent) {
          this.listarZapatoComponent.obtenerZapatos();
        }
      },
      error: (err) => {
        alert('Error al registrar el zapato');
        console.error('Error:', err);
      }
    });
  }

  obtenerProveedores() {
    this.servicioProveedor.ObtenerProveedores().subscribe({
      next: (respuesta: ProveedorModel[]) => {
        this.proveedores = respuesta;
        this.proveedoresNombres = this.proveedores.map(
          p => `${p.Nombre} (ID: ${p.id})`
        );
      },
      error: (err) => {
        alert('Error al obtener los proveedores');
        console.error('Error:', err);
      }
    });
  }

  onProveedorSeleccionado(nombreCompleto: string): void {
    const match = nombreCompleto.match(/\(ID:\s*(\d+)\)/);
    if (match) {
      const proveedorId = match[1];
      this.fGroup.get('proveedorId')?.setValue(proveedorId);
    }
  }

  habilitarCodigoBarra(event: Event) {
    this.codigoBarraHabilitado = (event.target as HTMLInputElement).checked;

    if (this.codigoBarraHabilitado) {
      this.fGroup.get('CodigoBarra')?.enable();
    } else {
      this.fGroup.get('CodigoBarra')?.disable();
    }
  }

  limpiarFormulario(): void {
    this.fGroup.reset();
    this.fGroup.get('CodigoBarra')?.disable();
    this.codigoBarraHabilitado = false;

    const checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = false;
    }
  }

  focusNext(currentField: HTMLElement, nextField?: HTMLElement) {
    const fieldName = currentField.id || currentField.getAttribute('formControlName') || '';

    if (this.fGroup.get(fieldName)?.valid) {
      currentField.blur();
      if (nextField) {
        // Verificar si el siguiente campo es el Color (multiselect)
        if (nextField.id === 'Color' && this.colorDirective) {
          this.colorDirective.focus();
        } else {
          nextField.focus();
        }
      }
    } else {
      currentField.focus();
      this.fGroup.get(fieldName)?.markAsTouched();
    }
  }

  submitOrFocusNext(currentField: HTMLElement) {
    currentField.blur();
    if (this.fGroup.valid) {
      this.RegistrarZapato();
    } else {
      for (const controlName in this.fGroup.controls) {
        const control = this.fGroup.get(controlName);
        if (control && control.invalid) {
          const invalidField = document.getElementById(controlName);
          if (invalidField) {
            // Si el campo inválido es Color, usar la directiva
            if (controlName === 'Color' && this.colorDirective) {
              this.colorDirective.focus();
            } else {
              invalidField.focus();
            }
          }
          break;
        }
      }
    }
  }

}