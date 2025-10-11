import { Component, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClienteModel } from '../../../../modelos/cliente.model';
import { ConfiguracionPaginacion } from '../../../../config/configuracion.paginacion';
import { ListarClienteComponent } from '../listar-cliente/listar-cliente.component';
import { ClienteService } from '../../../../servicios/parametros/cliente.service';

@Component({
  selector: 'app-crear-cliente',
  templateUrl: './crear-cliente.component.html',
  styleUrl: './crear-cliente.component.css'
})
export class CrearClienteComponent implements OnInit {
  @ViewChild(ListarClienteComponent) listarClienteComponent!: ListarClienteComponent;

  fGroup: FormGroup = new FormGroup({});
  clientes: ClienteModel[] = [];
  clientesFiltrados: ClienteModel[] = [];
  searchQuery: string = '';
  pag = 1;
  total = 0;
  totalItems = 0;
  registrosPorPagina = ConfiguracionPaginacion.registrosPorPagina;

  // Propiedades para el select de búsqueda de ciudad
  ciudadSearchQuery: string = '';
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
  ciudadesFiltradas: string[] = [];
  showCiudadDropdown: boolean = false;
  selectedCiudadIndex: number = -1;

  constructor(
    private fb: FormBuilder,
    private servicioCliente: ClienteService
  ) {}

  ngOnInit() {
    this.ConstruirFormulario();
    this.ciudadesFiltradas = [...this.ciudadesComunes];
  }

  get ObtenerFormGroup() {
    return this.fGroup.controls;
  }

  ConstruirFormulario() {
    this.fGroup = this.fb.group({
      Nombre: ['', [Validators.required, Validators.minLength(2)]],
      Apellido: ['', [Validators.required, Validators.minLength(2)]],
      Ciudad: ['', [Validators.required]],
      Barrio: [''],
      Correo: ['', [Validators.email]],
      Telefono: ['', [Validators.minLength(7), Validators.maxLength(10)]],
      FechaNac: [''],
      Identificacion:[''] 
    });
  }

  RegistrarCliente() {
    let campos = this.ObtenerFormGroup;
    let datos = {
      Nombre: campos["Nombre"].value,
      Apellido: campos["Apellido"].value,
      Identificacion: campos["Identificacion"].value || "", 
      Ciudad: campos["Ciudad"].value,
      Barrio: campos["Barrio"].value || "",
      Correo: campos["Correo"].value || "",
      Telefono: campos["Telefono"].value || "",
      FechaNac: new Date(campos["FechaNac"].value).toISOString(),
    };
    
    this.servicioCliente.RegistrarCliente(datos).subscribe({
      next: (respuesta: ClienteModel) => {
        alert("Cliente registrado correctamente");
        this.limpiarFormulario();
        if (this.listarClienteComponent) {
          this.listarClienteComponent.obtenerClientes();
        }
      },
      error: (err) => {
        alert("Error al registrar el cliente");
        console.error('Error:', err);
      }
    });
  }


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

  limpiarFormulario(): void {
    this.fGroup.reset();
    this.limpiarCiudadSeleccionada();
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
      this.RegistrarCliente();
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