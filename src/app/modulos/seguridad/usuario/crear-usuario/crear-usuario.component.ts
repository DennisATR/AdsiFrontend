import { Component, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeguridadService } from '../../../../servicios/seguridad.service';
import { UsuarioModel } from '../../../../modelos/usuario.model';
import { RolModel } from '../../../../modelos/rol.model';
import { ListarUsuarioComponent } from '../listar-usuario/listar-usuario.component';

@Component({
  selector: 'app-crear-usuario',
  templateUrl: './crear-usuario.component.html',
  styleUrl: './crear-usuario.component.css'
})
export class CrearUsuarioComponent implements OnInit {
  @ViewChild(ListarUsuarioComponent) listarUsuarioComponent!: ListarUsuarioComponent;

  fGroup: FormGroup = new FormGroup({});
  rolesDisponibles: RolModel[] = [];
  rolesNombres: string[] = [];

  constructor(
    private fb: FormBuilder,
    private servicioSeguridad: SeguridadService
  ) { }

  ngOnInit() {
    this.ConstruirFormulario();
    this.obtenerRoles();
  }

  ConstruirFormulario() {
    this.fGroup = this.fb.group({
      Nombre: ['', [Validators.required, Validators.minLength(2)]],
      Apellido: ['', [Validators.required, Validators.minLength(2)]],
      Rol: ['', [Validators.required]],
      RolNombre: ['', [Validators.required]],
      Contraseña: ['', [Validators.required, Validators.minLength(3)]],
      Correo: ['', [Validators.required, Validators.email]],
      Telefono: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  obtenerRoles() {
    this.servicioSeguridad.ObtenerRoles().subscribe({
      next: (respuesta: RolModel[]) => {
        this.rolesDisponibles = respuesta;
        this.rolesNombres = this.rolesDisponibles.map(
          rol => `${rol.Nombre} (ID: ${rol.id})`
        );
      },
      error: (err) => {
        alert('Error al obtener los roles');
        console.error('Error:', err);
      }
    });
  }

  onRolSeleccionado(nombreCompleto: string): void {
    const match = nombreCompleto.match(/\(ID:\s*(\d+)\)/);
    if (match) {
      const rolId = parseInt(match[1], 10);
      this.fGroup.get('Rol')?.setValue(rolId);
    }
  }

  Registrarse() {
    let campos = this.ObtenerFormGroup;

    let datos = {
      Nombre: campos['Nombre'].value,
      Telefono: campos['Telefono'].value,
      Apellido: campos['Apellido'].value,
      Clave: campos['Contraseña'].value,
      Correo: campos['Correo'].value,
      rolId: Number(campos['Rol'].value)
    };

    if (typeof datos.rolId !== 'number' || isNaN(datos.rolId)) {
      alert('El rol seleccionado no es válido.');
      return;
    }

    this.servicioSeguridad.RegistrarUsuario(datos).subscribe({
      next: (respuesta: UsuarioModel) => {
        alert('Registro correcto, se ha enviado un mensaje para validar su dirección de correo electrónico.');
        if (this.listarUsuarioComponent) {
          this.listarUsuarioComponent.obtenerUsuarios();
        }
        this.limpiarFormulario();
      },
      error: (err) => {
        if (err.error && err.error.error && err.error.error.message) {
          alert(err.error.error.message);
        } else {
          alert('Ocurrió un error inesperado.');
        }
        console.error('Error:', err);
      }
    });
  }

  limpiarFormulario(): void {
    this.fGroup.reset();
  }

  get ObtenerFormGroup() {
    return this.fGroup.controls;
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
      this.Registrarse();
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