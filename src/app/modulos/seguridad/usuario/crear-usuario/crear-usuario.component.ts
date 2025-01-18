import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeguridadService } from '../../../../servicios/seguridad.service';
import { UsuarioModel } from '../../../../modelos/usuario.model';

@Component({
  selector: 'app-crear-usuario',
  templateUrl: './crear-usuario.component.html',
  styleUrl: './crear-usuario.component.css'
})
export class CrearUsuarioComponent {
  fGroup: FormGroup = new FormGroup({});
  usuarios: UsuarioModel[] = [];
  usuariosFiltrados: UsuarioModel[] = [];
  searchQuery: string = '';

  constructor(
    private fb: FormBuilder,
    private servicioSeguridad: SeguridadService
  ) {
  }

  ngOnInit() {
    this.ConstruirFormulario();
    this.obtenerUsuarios();
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
    // mapear los valores del rol
    if (campos["Rol"].value === 'Administrador') {
      campos["Rol"].setValue(1);
    } else if (campos["Rol"].value === 'Vendedor') {
      campos["Rol"].setValue(2);
    }
    else if (campos["Rol"].value === 'Bodeguero') {
      campos["Rol"].setValue(3);
    }

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
      next: (respuesta:UsuarioModel) => {
        alert("Registro correcto, se ha enviado un mensaje para validar su dirección de correo electrónico.")
        this.obtenerUsuarios(); // Actualiza la lista de usuarios después del registro
      },
      error: (err) => {
        alert("Se ha producido un error en el registro.")
      }
    });

  }

  obtenerUsuarios(): void {
    this.servicioSeguridad.obtenerUsuarios().subscribe({
      next: (respuesta) => {
        console.log('Respuesta obtenida:', respuesta);
        this.usuarios=respuesta; // Asigna la respuesta al array de usuarios
        this.usuariosFiltrados = [...this.usuarios]; // Inicializa los usuarios filtrados con todos los usuarios
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

    /**
   * Filtrar usuarios según el texto ingresado
   */
    filtrarUsuarios(): void {
      const query = this.searchQuery.toLowerCase();
      if (!query) {
        // Si no hay texto en el campo de búsqueda, mostrar todos los usuarios
        this.usuariosFiltrados = [...this.usuarios];
      } else {
          this.usuariosFiltrados = this.usuarios.filter(usuario => 
          (usuario.Nombre?.toLowerCase().includes(query) || '') ||
          (usuario.Apellido?.toLowerCase().includes(query) || '') ||
          (usuario.Correo?.toLowerCase().includes(query) || '') ||
          String(usuario.Telefono).includes(query) ||
          String(usuario.rolId).includes(query)
          );
      }
    }
  
  
  get ObtenerFormGroup(){
    return this.fGroup.controls;
  }

  onEnterRol(rolInput: HTMLInputElement, nextField?: HTMLElement): void {
    const rolValue = rolInput.value.trim();
    let rolName = '';
  
    // Mapeo de valores numéricos a los nombres de los roles
    switch (rolValue) {
      case '1':
        rolName = 'Administrador';
        break;
      case '2':
        rolName = 'Vendedor';
        break;
      case '3':
        rolName = 'Bodeguero';
        break;
      default:
        rolName = ''; // Si no coincide, se deja vacío o se puede asignar un valor por defecto
        break;
    }
  
    // Actualizar el campo con el nombre del rol
    rolInput.value = rolName;
  
    if (this.fGroup.get(rolInput.id)?.valid) {
      rolInput.blur(); // Quita el foco actual
      if (nextField) {
        nextField.focus(); // Mueve el foco al siguiente campo
      }
    } else {
      // Si el campo no es válido, mantenemos el foco en el campo actual
      rolInput.focus();
      this.fGroup.get(rolInput.id)?.markAsTouched();
    }
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
  