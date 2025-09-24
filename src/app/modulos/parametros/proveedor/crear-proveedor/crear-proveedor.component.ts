import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProveedorModel } from '../../../../modelos/proveedor.model';
import { ListarProveedorComponent } from '../listar-proveedor/listar-proveedor.component';
import { ProveedorService } from '../../../../servicios/parametros/proveedor.service';

@Component({
  selector: 'app-crear-proveedor',
  templateUrl: './crear-proveedor.component.html',
  styleUrls: ['./crear-proveedor.component.css']
})
export class CrearProveedorComponent {
  @ViewChild(ListarProveedorComponent) listarProveedorComponent!: ListarProveedorComponent;
  fGroup: FormGroup = new FormGroup({});

  // Propiedades para el selector de ciudades inteligente
  ciudadSearchQuery: string = '';
  ciudadesFiltradas: string[] = [];
  showCiudadDropdown: boolean = false;
  selectedCiudadIndex: number = -1;
  ciudadesComunes: string[] = [
    'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena',
    'Cúcuta', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué',
    'Pasto', 'Manizales', 'Neiva', 'Villavicencio', 'Armenia',
    'Valledupar', 'Montería', 'Sincelejo', 'Popayán', 'Tunja',
    'Florencia', 'Riohacha', 'Yopal', 'Quibdó', 'Leticia',
    'San Andrés', 'Mitú', 'Puerto Carreño', 'Inírida', 'Mocoa',
    'Arauca', 'Apartadó', 'Itagüí', 'Soacha', 'Bello',
    'Envigado', 'Palmira', 'Buenaventura', 'Tumaco', 'Ipiales', 
    'Tuquerres', 'Maicao'
  ];

  constructor(
    private fb: FormBuilder,
    private servicioProveedor: ProveedorService
  ) {}

  ngOnInit() {
    this.ConstruirFormulario();
    
    // Inicializar ciudades filtradas
    this.ciudadesFiltradas = [...this.ciudadesComunes];
  }

  get ObtenerFormGroup() {
    return this.fGroup.controls;
  }

  ConstruirFormulario() {
    this.fGroup = this.fb.group({
      Nombre: ['', Validators.required],
      Empresa: ['', Validators.required],
      Telefono: ['', [Validators.required, Validators.pattern(/^\d{7,10}$/)]],
      Correo: ['', [Validators.required, Validators.email]],
      Ciudad: ['', Validators.required],
      NIT: ['', Validators.required],
    });
  }

  RegistrarProveedor() {
    let campos = this.ObtenerFormGroup;
    let datos: ProveedorModel = {
      Nombre: campos['Nombre'].value,
      Empresa: campos['Empresa'].value,
      Telefono: campos['Telefono'].value,
      Correo: campos['Correo'].value,
      Ciudad: campos['Ciudad'].value,
      NIT: campos['NIT'].value,
    };
    console.log("Datos del proveedor a registrar:", datos);

    this.servicioProveedor.RegistrarProveedor(datos).subscribe({
      next: (respuesta: ProveedorModel) => {
        alert('Proveedor registrado correctamente');
        this.listarProveedorComponent.obtenerProveedores();
        this.limpiarFormulario();
      },
      error: () => {
        alert('Error al registrar el proveedor');
      }
    });
  }

  // Métodos para el selector de ciudades inteligente
  onCiudadSearchInput(): void {
    const query = this.ciudadSearchQuery.toLowerCase().trim();
    
    if (!query) {
      this.ciudadesFiltradas = [...this.ciudadesComunes];
    } else {
      // Filtrar ciudades que coincidan con la búsqueda
      this.ciudadesFiltradas = this.ciudadesComunes.filter(ciudad => 
        ciudad.toLowerCase().includes(query)
      );
      
      // Si no hay coincidencias exactas, agregar el texto como opción personalizada
      if (this.ciudadesFiltradas.length === 0 || 
          !this.ciudadesFiltradas.some(ciudad => ciudad.toLowerCase() === query)) {
        this.ciudadesFiltradas.unshift(this.ciudadSearchQuery); // Agregar al inicio
      }
    }
    
    this.showCiudadDropdown = true;
    this.selectedCiudadIndex = -1;
    
    // Actualizar el valor del formulario
    this.fGroup.get('Ciudad')?.setValue(this.ciudadSearchQuery);
  }

  onCiudadKeydown(event: KeyboardEvent, nextField?: HTMLElement): void {
    if (!this.showCiudadDropdown) {
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
        this.selectedCiudadIndex = Math.min(
          this.selectedCiudadIndex + 1,
          this.ciudadesFiltradas.length - 1
        );
        this.scrollToSelectedCiudadOption();
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        this.selectedCiudadIndex = Math.max(this.selectedCiudadIndex - 1, 0);
        this.scrollToSelectedCiudadOption();
        break;
        
      case 'Enter':
        event.preventDefault();
        if (this.selectedCiudadIndex >= 0 && this.selectedCiudadIndex < this.ciudadesFiltradas.length) {
          this.seleccionarCiudad(this.ciudadesFiltradas[this.selectedCiudadIndex]);
          if (nextField) {
            nextField.focus();
          }
        } else if (nextField) {
          if (this.fGroup.get('Ciudad')?.valid) {
            nextField.focus();
          }
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        this.showCiudadDropdown = false;
        this.selectedCiudadIndex = -1;
        break;
        
      case 'Tab':
        this.showCiudadDropdown = false;
        this.selectedCiudadIndex = -1;
        break;
    }
  }

  scrollToSelectedCiudadOption(): void {
    if (this.selectedCiudadIndex >= 0) {
      setTimeout(() => {
        const dropdown = document.querySelector('.search-select-dropdown');
        const selectedOption = dropdown?.querySelector(`.search-select-option:nth-child(${this.selectedCiudadIndex + 1})`);
        
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

  onCiudadFocus(): void {
    this.showCiudadDropdown = true;
    this.ciudadesFiltradas = [...this.ciudadesComunes];
    this.selectedCiudadIndex = -1;
  }

  onCiudadBlur(): void {
    // Delay para permitir que el click en la opción se registre
    setTimeout(() => {
      this.showCiudadDropdown = false;
      this.selectedCiudadIndex = -1;
    }, 200);
  }

  seleccionarCiudad(ciudad: string): void {
    this.ciudadSearchQuery = ciudad;
    this.fGroup.get('Ciudad')?.setValue(ciudad);
    this.showCiudadDropdown = false;
    this.selectedCiudadIndex = -1;
  }

  onCiudadOptionHover(index: number): void {
    this.selectedCiudadIndex = index;
  }

  limpiarCiudadSeleccionada(): void {
    this.ciudadSearchQuery = '';
    this.fGroup.get('Ciudad')?.setValue('');
    this.ciudadesFiltradas = [...this.ciudadesComunes];
    this.selectedCiudadIndex = -1;
  }

  /**
   * Limpia el formulario después de guardar exitosamente
   */
  limpiarFormulario(): void {
    this.fGroup.reset();
    this.limpiarCiudadSeleccionada();
  }

  focusNext(currentField: HTMLElement, nextField?: HTMLElement) {
    if (this.fGroup.get(currentField.id)?.valid) {
      currentField.blur();
      if (nextField) {
        nextField.focus();
      }
    } else {
      currentField.focus();
      this.fGroup.get(currentField.id)?.markAsTouched();
    }
  }

  submitOrFocusNext(currentField: HTMLElement) {
    currentField.blur();
    if (this.fGroup.valid) {
      this.RegistrarProveedor();
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
