import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfiguracionRutasBackend } from '../../../../config/configuracion.rutas.backend';
import { UsuarioModel } from '../../../../modelos/usuario.model';
import { RolModel } from '../../../../modelos/rol.model';
import { ActivatedRoute, Router } from '@angular/router';
import { SeguridadService } from '../../../../servicios/seguridad.service';

@Component({
  selector: 'app-editar-usuario',
  templateUrl: './editar-usuario.component.html',
  styleUrl: './editar-usuario.component.css'
})
export class EditarUsuarioComponent implements OnInit {
  BASE_URL: String = ConfiguracionRutasBackend.urlBackend;
  recordId: number = 0;
  fgValidador!: FormGroup;
  
  rolesDisponibles: RolModel[] = [];
  rolesNombres: string[] = [];

  constructor(
    private fb: FormBuilder,
    private servicio: SeguridadService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.recordId = this.route.snapshot.params["id"];
    this.ConstruirFormulario();
  }

  ngOnInit(): void {
    this.obtenerRoles();
  }

  ConstruirFormulario() {
    this.fgValidador = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.minLength(10)]],
      clave: ['', [Validators.required, Validators.minLength(3)]],
      rol: ['', [Validators.required]],
      rolNombre: ['', [Validators.required]]
    });
  }

  obtenerRoles() {
    this.servicio.ObtenerRoles().subscribe({
      next: (respuesta: RolModel[]) => {
        this.rolesDisponibles = respuesta;
        this.rolesNombres = this.rolesDisponibles.map(
          rol => `${rol.Nombre} (ID: ${rol.id})`
        );
        // Después de obtener los roles, buscar el registro
        this.BuscarRegistro();
      },
      error: (err) => {
        alert('Error al obtener los roles');
        console.error('Error:', err);
      }
    });
  }

  BuscarRegistro() {
    this.servicio.BuscarUsuario(this.recordId).subscribe({
      next: (datos: UsuarioModel) => {
        // Buscar el nombre del rol para mostrar en el input
        const rolEncontrado = this.rolesDisponibles.find(r => r.id === datos.rolId);
        const rolNombreCompleto = rolEncontrado 
          ? `${rolEncontrado.Nombre} (ID: ${rolEncontrado.id})`
          : '';

        this.fgValidador.patchValue({
          nombre: datos.Nombre,
          apellido: datos.Apellido,
          correo: datos.Correo,
          telefono: datos.Telefono,
          clave: datos.Clave,
          rol: datos.rolId,
          rolNombre: rolNombreCompleto
        });
      },
      error: (err) => {
        alert("El registro no existe.");
        this.router.navigate(['/seguridad/usuario/crear-usuario']);
      }
    });
  }

  onRolSeleccionado(nombreCompleto: string): void {
    const match = nombreCompleto.match(/\(ID:\s*(\d+)\)/);
    if (match) {
      const rolId = parseInt(match[1], 10);
      this.fgValidador.patchValue({ rol: rolId });
    }
  }

  ActualizarRegistro() {
    if (this.fgValidador.invalid) {
      alert("Formulario inválido. Por favor complete todos los campos correctamente.");
      return;
    }

    let datos = {
      Nombre: this.fgValidador.controls['nombre'].value,
      Telefono: this.fgValidador.controls['telefono'].value,
      FechaReg: new Date(),
      Apellido: this.fgValidador.controls['apellido'].value,
      Clave: this.fgValidador.controls['clave'].value,
      Correo: this.fgValidador.controls['correo'].value,
      rolId: this.fgValidador.controls['rol'].value,
    };

    this.servicio.EditarUsuario(this.recordId, datos).subscribe({
      next: (data: any) => {
        alert("Información actualizada correctamente");
        this.router.navigate(['/seguridad/usuario/crear-usuario']);
      },
      error: (err: any) => {
        if (err.error && err.error.error && err.error.error.message) {
          alert(err.error.error.message);
        } else {
          alert("Ocurrió un error inesperado.");
        }
        console.error('Error:', err);
      }
    });
  }

  // Getters para validaciones
  get nombre() { return this.fgValidador.get('nombre'); }
  get apellido() { return this.fgValidador.get('apellido'); }
  get correo() { return this.fgValidador.get('correo'); }
  get telefono() { return this.fgValidador.get('telefono'); }
  get clave() { return this.fgValidador.get('clave'); }
  get rol() { return this.fgValidador.get('rol'); }
}