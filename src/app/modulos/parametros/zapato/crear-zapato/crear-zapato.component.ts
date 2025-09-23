import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ParametrosService } from '../../../../servicios/parametros.service';
import { ZapatoModel } from '../../../../modelos/zapato.model';
import { ConfiguracionPaginacion } from '../../../../config/configuracion.paginacion';
import { ProveedorModel } from '../../../../modelos/proveedor.model';

@Component({
  selector: 'app-crear-zapato',
  templateUrl: './crear-zapato.component.html',
  styleUrl: './crear-zapato.component.css'
})
export class CrearZapatoComponent {
  fGroup: FormGroup = new FormGroup({});
  zapatos: ZapatoModel[] = [];
  zapatosFiltrados: ZapatoModel[] = [];
  proveedores: ProveedorModel[] = [];
  searchQuery: string = '';
  pag = 1;
  total = 0;
  totalItems = 0;
  registrosPorPagina = ConfiguracionPaginacion.registrosPorPagina;
  codigoBarraHabilitado: boolean = false;

  // Nuevas propiedades para el select de búsqueda
  proveedorSearchQuery: string = '';
  proveedoresFiltrados: ProveedorModel[] = [];
  showProveedorDropdown: boolean = false;
  proveedorSeleccionado: ProveedorModel | null = null;
  selectedProveedorIndex: number = -1; // Índice del proveedor seleccionado con teclado

  constructor(
    private fb: FormBuilder,
    private servicioParametros: ParametrosService
  ) {
  }

  ngOnInit() {
    this.ConstruirFormulario();
    this.obtenerZapatos();
    this.obtenerProveedores();
    this.fGroup.get('CodigoBarra')?.disable();
  }

  get ObtenerFormGroup(){
    return this.fGroup.controls;
  }

  /**
   * Construcción del formulario con los controles
   */
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
    });
  }

  RegistrarZapato() {
    let campos = this.ObtenerFormGroup;
    let datos = {
      id: campos["CodigoBarra"].value,
      Descripcion: campos["Descripcion"].value,
      Categoria: campos["Categoria"].value,
      Talla: campos["Talla"].value,
      Color: campos["Color"].value,
      Ganancia: 0,
      Referencia: campos["Referencia"].value,
      PrecioVentaMax: campos["PrecioVentaMax"].value,
      PrecioVentaMin: campos["PrecioVentaMin"].value,
      Cantidad: campos["Cantidad"].value,
      Fecha: new Date().toISOString(),
      proveedorId: parseInt(campos["proveedorId"].value),
    };
    console.log(datos);
    this.servicioParametros.RegistrarZapato(datos).subscribe({
      next: (respuesta: ZapatoModel) => {
        alert("Zapato registrado correctamente");
        this.obtenerZapatos();
        this.limpiarFormulario();
      },
      error: (err) => {
        alert("Error al registrar el zapato");
      }
    });
  }

  obtenerZapatos() {
    this.servicioParametros.ObtenerZapatos().subscribe({
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
    this.servicioParametros.ObtenerProveedores().subscribe({
      next: (respuesta: ProveedorModel[]) => {
        this.proveedores = respuesta;
        this.proveedoresFiltrados = [...this.proveedores]; // Inicializar filtrados
      },
      error: (err) => {
        alert("Error al obtener los proveedores");
      }
    });
  }

  /**
   * Obtiene el nombre del proveedor por su ID para mostrar en la tabla
   */
  obtenerNombreProveedor(proveedorId: number): string {
    const proveedor = this.proveedores.find(p => p.id === proveedorId);
    return proveedor ? (proveedor.Nombre ?? '') : `ID: ${proveedorId}`;
  }

  // Nuevos métodos para el select de búsqueda
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
    this.selectedProveedorIndex = -1; // Resetear selección de teclado
    
    // Limpiar selección si no hay coincidencias exactas
    if (this.proveedorSeleccionado && 
        !this.proveedorSeleccionado.Nombre?.toLowerCase().includes(query) &&
        !this.proveedorSeleccionado.id?.toString().includes(query)) {
      this.proveedorSeleccionado = null;
      this.fGroup.get('proveedorId')?.setValue('');
    }
  }

  onProveedorKeydown(event: KeyboardEvent, nextField?: HTMLElement): void {
    if (!this.showProveedorDropdown) {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (nextField) {
          nextField.focus();
        }
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedProveedorIndex = Math.min(
          this.selectedProveedorIndex + 1,
          this.proveedoresFiltrados.length - 1
        );
        this.scrollToSelectedOption();
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        this.selectedProveedorIndex = Math.max(this.selectedProveedorIndex - 1, 0);
        this.scrollToSelectedOption();
        break;
        
      case 'Enter':
        event.preventDefault();
        if (this.selectedProveedorIndex >= 0 && this.selectedProveedorIndex < this.proveedoresFiltrados.length) {
          this.seleccionarProveedor(this.proveedoresFiltrados[this.selectedProveedorIndex]);
          if (nextField) {
            nextField.focus();
          }
        } else if (nextField) {
          // Si no hay selección con teclado, verificar si el campo es válido y pasar al siguiente
          if (this.fGroup.get('proveedorId')?.valid) {
            nextField.focus();
          }
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        this.showProveedorDropdown = false;
        this.selectedProveedorIndex = -1;
        break;
        
      case 'Tab':
        this.showProveedorDropdown = false;
        this.selectedProveedorIndex = -1;
        break;
    }
  }

  scrollToSelectedOption(): void {
    if (this.selectedProveedorIndex >= 0) {
      setTimeout(() => {
        const dropdown = document.querySelector('.search-select-dropdown');
        const selectedOption = document.querySelector(`.search-select-option:nth-child(${this.selectedProveedorIndex + 1})`);
        
        if (dropdown && selectedOption) {
          const dropdownRect = dropdown.getBoundingClientRect();
          const optionRect = selectedOption.getBoundingClientRect();
          
          if (optionRect.bottom > dropdownRect.bottom) {
            dropdown.scrollTop += optionRect.bottom - dropdownRect.bottom;
          } else if (optionRect.top < dropdownRect.top) {
            dropdown.scrollTop -= dropdownRect.top - optionRect.top;
          }
        }
      });
    }
  }

  onProveedorFocus(): void {
    this.showProveedorDropdown = true;
    this.proveedoresFiltrados = [...this.proveedores];
    this.selectedProveedorIndex = -1;
  }

  onProveedorBlur(): void {
    // Delay para permitir que el click en la opción se registre
    setTimeout(() => {
      this.showProveedorDropdown = false;
      this.selectedProveedorIndex = -1;
    }, 200);
  }

  seleccionarProveedor(proveedor: ProveedorModel): void {
    this.proveedorSeleccionado = proveedor;
    this.proveedorSearchQuery = `${proveedor.Nombre} (ID: ${proveedor.id})`;
    this.fGroup.get('proveedorId')?.setValue(proveedor.id);
    this.showProveedorDropdown = false;
    this.selectedProveedorIndex = -1;
  }

  onProveedorOptionHover(index: number): void {
    this.selectedProveedorIndex = index;
  }

  limpiarProveedorSeleccionado(): void {
    this.proveedorSeleccionado = null;
    this.proveedorSearchQuery = '';
    this.fGroup.get('proveedorId')?.setValue('');
    this.proveedoresFiltrados = [...this.proveedores];
    this.selectedProveedorIndex = -1;
  }

  habilitarCodigoBarra(event: Event) {
    this.codigoBarraHabilitado = (event.target as HTMLInputElement).checked;
  
    if (this.codigoBarraHabilitado) {
      this.fGroup.get('CodigoBarra')?.enable();
    } else {
      this.fGroup.get('CodigoBarra')?.disable();
    }
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

  /**
   * Limpia el formulario después de guardar exitosamente
   */
  limpiarFormulario(): void {
    this.fGroup.reset();
    this.fGroup.get('CodigoBarra')?.disable();
    this.codigoBarraHabilitado = false;
    
    // Limpiar campos del proveedor
    this.limpiarProveedorSeleccionado();
    
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
        nextField.focus();
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
            invalidField.focus();
          }
          break;
        }
      }
    }
  }
}