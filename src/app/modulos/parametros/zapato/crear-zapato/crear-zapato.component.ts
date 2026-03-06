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

  // Formularios
  fGroup: FormGroup = new FormGroup({});
  fGroupSerie: FormGroup = new FormGroup({});

  // Control de pestañas
  tabActiva: 'unidad' | 'serie' = 'unidad';

  zapatos: ZapatoModel[] = [];
  zapatosFiltrados: ZapatoModel[] = [];
  proveedores: ProveedorModel[] = [];
  proveedoresNombres: string[] = [];
  colores = ConfiguracionListas.colores;
  searchQuery: string = '';
  pag = 1;
  total = 0;
  totalItems = 0;
  registrosPorPagina = ConfiguracionPaginacion.registrosPorPagina;
  codigoBarraHabilitado: boolean = false;
  prefijoCodigoBarraHabilitado: boolean = false;
  categoriasComunes = ConfiguracionListas.categoriasZapatos;

  constructor(
    private fb: FormBuilder,
    private servicioZapato: ZapatoService,
    private servicioProveedor: ProveedorService
  ) { }

  ngOnInit() {
    this.ConstruirFormulario();
    this.ConstruirFormularioSerie();
    this.obtenerProveedores();
    this.fGroup.get('CodigoBarra')?.disable();
    this.fGroupSerie.get('Prefijo')?.disable();
  }

  get ObtenerFormGroup() {
    return this.fGroup.controls;
  }

  get ObtenerFormGroupSerie() {
    return this.fGroupSerie.controls;
  }

  cambiarTab(tab: 'unidad' | 'serie') {
  this.tabActiva = tab;
  
  // Sincronizar el estado de los checkboxes y campos después del cambio de vista
  setTimeout(() => {
    if (tab === 'unidad') {
      const checkboxCodigoBarra = document.querySelector('#checkboxCodigoBarra') as HTMLInputElement;
      if (checkboxCodigoBarra) {
        checkboxCodigoBarra.checked = this.codigoBarraHabilitado;
      }
      // Asegurar el estado del campo
      if (this.codigoBarraHabilitado) {
        this.fGroup.get('CodigoBarra')?.enable();
      } else {
        this.fGroup.get('CodigoBarra')?.disable();
      }
    } else if (tab === 'serie') {
      const checkboxPrefijo = document.querySelector('#checkboxPrefijo') as HTMLInputElement;
      if (checkboxPrefijo) {
        checkboxPrefijo.checked = this.prefijoCodigoBarraHabilitado;
      }
      // Asegurar el estado del campo
      if (this.prefijoCodigoBarraHabilitado) {
        this.fGroupSerie.get('Prefijo')?.enable();
      } else {
        this.fGroupSerie.get('Prefijo')?.disable();
      }
    }
  }, 0);
}

  ConstruirFormulario() {
    this.fGroup = this.fb.group({
      CodigoBarra: [''],
      Descripcion: ['', Validators.required],
      Categoria: ['', Validators.required],
      Talla: ['', Validators.required],
      Color: ['', Validators.required],
      Referencia: ['', Validators.required],
      PrecioVentaMax: ['', Validators.required],
      PrecioVentaMin: ['', Validators.required],
      Cantidad: ['', Validators.required],
      proveedorId: ['', Validators.required],
      ProveedorNombre: ['', Validators.required],
    });
  }

  ConstruirFormularioSerie() {
    this.fGroupSerie = this.fb.group({
      Prefijo: [''],
      Descripcion: ['', Validators.required],
      Categoria: ['', Validators.required],
      Color: ['', Validators.required],
      Referencia: ['', Validators.required],
      PrecioVentaMax: ['', Validators.required],
      PrecioVentaMin: ['', Validators.required],
      Cantidad: ['', Validators.required],
      TallaInicial: ['', Validators.required],
      TallaFinal: ['', Validators.required],
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
      Referencia: campos['Referencia'].value,
      PrecioVentaMax: campos['PrecioVentaMax'].value,
      PrecioVentaMin: campos['PrecioVentaMin'].value,
      Cantidad: campos['Cantidad'].value,
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
        if (err.error && err.error.error && err.error.error.message) {
          alert(err.error.error.message);
        } else {
          alert('Ocurrió un error inesperado.');
        }
      }
    });
  }

  RegistrarZapatoSerie() {
    if (this.fGroupSerie.invalid) {
      Object.keys(this.fGroupSerie.controls).forEach(key => {
        this.fGroupSerie.get(key)?.markAsTouched();
      });
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    let campos = this.ObtenerFormGroupSerie;
    let datos = {
      Prefijo: campos['Prefijo'].value,
      Descripcion: campos['Descripcion'].value,
      Categoria: campos['Categoria'].value,
      Color: campos['Color'].value,
      Referencia: campos['Referencia'].value,
      PrecioVentaMax: campos['PrecioVentaMax'].value,
      PrecioVentaMin: campos['PrecioVentaMin'].value,
      Cantidad: this.parseCantidad(campos['Cantidad'].value),
      TallaInicial: parseInt(campos['TallaInicial'].value),
      TallaFinal: parseInt(campos['TallaFinal'].value),
      proveedorId: parseInt(campos['proveedorId'].value),
    };

    console.log('Datos para serie:', datos);

    this.servicioZapato.RegistrarZapatoSerie(datos).subscribe({
      next: (respuesta: any) => {
        alert('Serie de zapatos registrada correctamente');
        this.limpiarFormularioSerie();
        if (this.listarZapatoComponent) {
          this.listarZapatoComponent.obtenerZapatos();
        }
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

  onProveedorSeleccionadoSerie(nombreCompleto: string): void {
    const match = nombreCompleto.match(/\(ID:\s*(\d+)\)/);
    if (match) {
      const proveedorId = match[1];
      this.fGroupSerie.get('proveedorId')?.setValue(proveedorId);
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

  habilitarPrefijoCodigoBarra(event: Event) {
    this.prefijoCodigoBarraHabilitado = (event.target as HTMLInputElement).checked;

    if (this.prefijoCodigoBarraHabilitado) {
      this.fGroupSerie.get('Prefijo')?.enable();
    } else {
      this.fGroupSerie.get('Prefijo')?.disable();
    }
  }

  limpiarFormulario(): void {
    this.fGroup.reset();
    this.fGroup.get('CodigoBarra')?.disable();
    this.codigoBarraHabilitado = false;
    const checkboxCodigoBarra = document.querySelector('#checkboxCodigoBarra') as HTMLInputElement;
    if (checkboxCodigoBarra) {
      checkboxCodigoBarra.checked = false;
    }
  }

  limpiarFormularioSerie(): void {
    this.fGroupSerie.reset();
    this.fGroupSerie.get('Prefijo')?.disable();
    this.prefijoCodigoBarraHabilitado = false;

    const checkboxPrefijo = document.querySelector('#checkboxPrefijo') as HTMLInputElement;
    if (checkboxPrefijo) {
      checkboxPrefijo.checked = false;
    }
  }

  focusNext(currentField: HTMLElement, nextField?: HTMLElement) {
    const fieldName = currentField.id || currentField.getAttribute('formControlName') || '';
    const formGroup = this.tabActiva === 'unidad' ? this.fGroup : this.fGroupSerie;

    if (formGroup.get(fieldName)?.valid) {
      currentField.blur();
      if (nextField) {
        if (nextField.id === 'Color' && this.colorDirective) {
          this.colorDirective.focus();
        } else {
          nextField.focus();
        }
      }
    } else {
      currentField.focus();
      formGroup.get(fieldName)?.markAsTouched();
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
            invalidField.focus();
          }
          break;
        }
      }
    }
  }

  parseCantidad(valor: any): number | number[] {
    if (typeof valor === 'string') {
      const partes = valor.split(',').map(v => v.trim()).filter(v => v !== '');

      if (partes.length > 1) {
        return partes.map(v => Number(v));
      }
      return Number(partes[0]);
    }
    return valor;
  }


  submitOrFocusNextSerie(currentField: HTMLElement) {
    currentField.blur();
    if (this.fGroupSerie.valid) {
      this.RegistrarZapatoSerie();
    } else {
      for (const controlName in this.fGroupSerie.controls) {
        const control = this.fGroupSerie.get(controlName);
        if (control && control.invalid) {
          const invalidField = document.getElementById(controlName + 'Serie');
          if (invalidField) {
            invalidField.focus();
          }
          break;
        }
      }
    }
  }
}