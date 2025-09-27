import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfiguracionRutasBackend } from '../../../../config/configuracion.rutas.backend';
import { UsuarioModel } from '../../../../modelos/usuario.model';
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
  
  // Datos para el componente de búsqueda de rol
  rolesDisponibles = [
    { id: 1, nombre: 'Administrador' },
    { id: 2, nombre: 'Vendedor' },
    { id: 3, nombre: 'Bodeguero' }
  ];
  
  rolSearchQuery: string = '';
  rolesFiltrados = [...this.rolesDisponibles];
  rolSeleccionado: any = null;
  showRolDropdown: boolean = false;
  selectedRolIndex: number = -1;

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
    this.BuscarRegistro();
  }

  ConstruirFormulario() {
    this.fgValidador = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.minLength(10)]],
      clave: ['', [Validators.required, Validators.minLength(3)]],
      rol: ['', [Validators.required]]
    });
  }

  BuscarRegistro() {
    this.servicio.BuscarUsuario(this.recordId).subscribe({
      next: (datos: UsuarioModel) => {
        this.fgValidador.patchValue({
          nombre: datos.Nombre,
          apellido: datos.Apellido,
          correo: datos.Correo,
          telefono: datos.Telefono,
          clave: datos.Clave,
          rol: datos.rolId
        });
        
        // Configurar el rol seleccionado para el componente de búsqueda
        const rolEncontrado = this.rolesDisponibles.find(r => r.id === datos.rolId);
        if (rolEncontrado) {
          this.rolSeleccionado = rolEncontrado;
          this.rolSearchQuery = rolEncontrado.nombre;
        }
      },
      error: (err) => {
        alert("El registro no existe.");
        this.router.navigate(['/seguridad/usuario/crear-usuario']);
      }
    });
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

  // Métodos para el componente de búsqueda de rol
  onRolSearchInput() {
    this.rolesFiltrados = this.rolesDisponibles.filter(rol =>
      rol.nombre.toLowerCase().includes(this.rolSearchQuery.toLowerCase())
    );
    this.selectedRolIndex = -1;
  }

  onRolFocus() {
    this.showRolDropdown = true;
    this.onRolSearchInput();
  }

  onRolBlur() {
    setTimeout(() => {
      this.showRolDropdown = false;
    }, 200);
  }

  seleccionarRol(rol: any) {
    this.rolSeleccionado = rol;
    this.rolSearchQuery = rol.nombre;
    this.fgValidador.patchValue({ rol: rol.id });
    this.showRolDropdown = false;
  }

  limpiarRolSeleccionado() {
    this.rolSeleccionado = null;
    this.rolSearchQuery = '';
    this.fgValidador.patchValue({ rol: '' });
    this.rolesFiltrados = [...this.rolesDisponibles];
  }

  onRolKeydown(event: KeyboardEvent, nextElement?: HTMLElement) {
    if (!this.showRolDropdown) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedRolIndex = Math.min(this.selectedRolIndex + 1, this.rolesFiltrados.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedRolIndex = Math.max(this.selectedRolIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.selectedRolIndex >= 0 && this.selectedRolIndex < this.rolesFiltrados.length) {
          this.seleccionarRol(this.rolesFiltrados[this.selectedRolIndex]);
        }
        if (nextElement) nextElement.focus();
        break;
      case 'Escape':
        this.showRolDropdown = false;
        break;
    }
  }

  onRolOptionHover(index: number) {
    this.selectedRolIndex = index;
  }

  // Métodos para validaciones
  get nombre() { return this.fgValidador.get('nombre'); }
  get apellido() { return this.fgValidador.get('apellido'); }
  get correo() { return this.fgValidador.get('correo'); }
  get telefono() { return this.fgValidador.get('telefono'); }
  get clave() { return this.fgValidador.get('clave'); }
  get rol() { return this.fgValidador.get('rol'); }
}