import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeguridadService } from '../../../../servicios/seguridad.service';
import { UsuarioModel } from '../../../../modelos/usuario.model';
import { ConfiguracionPaginacion } from '../../../../config/configuracion.paginacion';
import { ListarUsuarioComponent } from '../listar-usuario/listar-usuario.component';

interface RolModel {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-crear-usuario',
  templateUrl: './crear-usuario.component.html',
  styleUrl: './crear-usuario.component.css'
})
export class CrearUsuarioComponent {
  // ViewChild para acceder al componente de listar usuarios
  @ViewChild(ListarUsuarioComponent) listarUsuarioComponent!: ListarUsuarioComponent;
  fGroup: FormGroup = new FormGroup({});

  // Propiedades para el selector de roles inteligente
  rolSearchQuery: string = '';
  rolesFiltrados: RolModel[] = [];
  showRolDropdown: boolean = false;
  rolSeleccionado: RolModel | null = null;
  selectedRolIndex: number = -1;
  rolesDisponibles: RolModel[] = [
    { id: 1, nombre: 'Administrador' },
    { id: 2, nombre: 'Vendedor' },
    { id: 3, nombre: 'Bodeguero' }
  ];

  constructor(
    private fb: FormBuilder,
    private servicioSeguridad: SeguridadService
  ) {
  }

  ngOnInit() {
    this.ConstruirFormulario();
    
    // Inicializar roles filtrados
    this.rolesFiltrados = [...this.rolesDisponibles];
  }

  /**
   * Construcción del formulario con los controles
   */
  ConstruirFormulario() {
    this.fGroup = this.fb.group({
      Nombre: ['', [Validators.required, Validators.minLength(2)]],
      Apellido: ['', [Validators.required, Validators.minLength(2)]],
      Rol: ['', [Validators.required, Validators.min(1), Validators.max(3)]],
      Contraseña: ['', [Validators.required, Validators.minLength(3)]],    
      Correo: ['', [Validators.required, Validators.email]],
      Telefono: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  /**
   * Función de registro público
   */
  Registrarse() {
    let campos = this.ObtenerFormGroup;

    let datos = {
      Nombre: campos["Nombre"].value,
      Telefono: campos["Telefono"].value,
      Apellido: campos["Apellido"].value,
      Clave: campos["Contraseña"].value,
      Correo: campos["Correo"].value,
      rolId: Number(campos["Rol"].value)
    }
    
    // Confirmar si rolId es efectivamente un número
    if (typeof datos.rolId !== 'number' || isNaN(datos.rolId)) {
      alert("El rol seleccionado no es válido.");
      return;
    }
    
    this.servicioSeguridad.RegistrarUsuario(datos).subscribe({
      next: (respuesta: UsuarioModel) => {
        alert("Registro correcto, se ha enviado un mensaje para validar su dirección de correo electrónico.")
        this.listarUsuarioComponent.obtenerUsuarios();
        this.limpiarFormulario(); // Limpiar formulario después de guardar
      },
      error: (err) => {
        alert("Se ha producido un error en el registro.")
      }
    });
  }

  // Métodos para el selector de roles inteligente
  onRolSearchInput(): void {
    const query = this.rolSearchQuery.toLowerCase().trim();
    
    if (!query) {
      this.rolesFiltrados = [...this.rolesDisponibles];
    } else {
      this.rolesFiltrados = this.rolesDisponibles.filter(rol => 
        rol.nombre.toLowerCase().includes(query) ||
        rol.id.toString().includes(query)
      );
    }
    
    this.showRolDropdown = true;
    this.selectedRolIndex = -1;
    
    // Actualizar el valor del formulario si hay una coincidencia exacta
    const rolExacto = this.rolesDisponibles.find(rol => 
      rol.nombre.toLowerCase() === query || rol.id.toString() === query
    );
    
    if (rolExacto) {
      this.fGroup.get('Rol')?.setValue(rolExacto.id);
    } else {
      this.fGroup.get('Rol')?.setValue('');
    }
  }

  onRolKeydown(event: KeyboardEvent, nextField?: HTMLElement): void {
    if (!this.showRolDropdown) {
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
        this.selectedRolIndex = Math.min(
          this.selectedRolIndex + 1,
          this.rolesFiltrados.length - 1
        );
        this.scrollToSelectedRolOption();
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        this.selectedRolIndex = Math.max(this.selectedRolIndex - 1, 0);
        this.scrollToSelectedRolOption();
        break;
        
      case 'Enter':
        event.preventDefault();
        if (this.selectedRolIndex >= 0 && this.selectedRolIndex < this.rolesFiltrados.length) {
          this.seleccionarRol(this.rolesFiltrados[this.selectedRolIndex]);
          if (nextField) {
            nextField.focus();
          }
        } else if (nextField) {
          if (this.fGroup.get('Rol')?.valid) {
            nextField.focus();
          }
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        this.showRolDropdown = false;
        this.selectedRolIndex = -1;
        break;
        
      case 'Tab':
        this.showRolDropdown = false;
        this.selectedRolIndex = -1;
        break;
    }
  }

  scrollToSelectedRolOption(): void {
    if (this.selectedRolIndex >= 0) {
      setTimeout(() => {
        const dropdown = document.querySelector('.search-select-dropdown');
        const selectedOption = dropdown?.querySelector(`.search-select-option:nth-child(${this.selectedRolIndex + 1})`);
        
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

  onRolFocus(): void {
    this.showRolDropdown = true;
    this.rolesFiltrados = [...this.rolesDisponibles];
    this.selectedRolIndex = -1;
  }

  onRolBlur(): void {
    // Delay para permitir que el click en la opción se registre
    setTimeout(() => {
      this.showRolDropdown = false;
      this.selectedRolIndex = -1;
    }, 200);
  }

  seleccionarRol(rol: RolModel): void {
    this.rolSeleccionado = rol;
    this.rolSearchQuery = `${rol.nombre}`;
    this.fGroup.get('Rol')?.setValue(rol.id);
    this.showRolDropdown = false;
    this.selectedRolIndex = -1;
  }

  onRolOptionHover(index: number): void {
    this.selectedRolIndex = index;
  }

  limpiarRolSeleccionado(): void {
    this.rolSeleccionado = null;
    this.rolSearchQuery = '';
    this.fGroup.get('Rol')?.setValue('');
    this.rolesFiltrados = [...this.rolesDisponibles];
    this.selectedRolIndex = -1;
  }

  /**
   * Limpia el formulario después de guardar exitosamente
   */
  limpiarFormulario(): void {
    this.fGroup.reset();
    this.limpiarRolSeleccionado();
  }

  get ObtenerFormGroup(){
    return this.fGroup.controls;
  }

  focusNext(currentField: HTMLElement, nextField?: HTMLElement) {
    // Verificamos si el campo actual es válido antes de mover el foco
    if (this.fGroup.get(currentField.id)?.valid) {
      currentField.blur(); // Quita el foco actual
      if (nextField) {
        nextField.focus(); // Mueve el foco al siguiente campo
      }
    } else {
      // Si el campo no es válido, mantenemos el foco en el campo actual
      currentField.focus();
      this.fGroup.get(currentField.id)?.markAsTouched();
    }
  }
  
  submitOrFocusNext(currentField: HTMLElement) {
    currentField.blur();
    if (this.fGroup.valid) {
      this.Registrarse();
    } else {
      // Si el formulario no es válido, mantener el foco en el campo que tiene el error
      for (const controlName in this.fGroup.controls) {
        const control = this.fGroup.get(controlName);
        if (control && control.invalid) {
          const invalidField = document.getElementById(controlName);
          if (invalidField) {
            invalidField.focus();
          }
          break; // Solo nos movemos al primer campo inválido
        }
      }
    }
  }
}
  