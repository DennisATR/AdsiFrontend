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
      Rol: ['', [Validators.required, Validators.minLength(2)]],
      correo: ['', [Validators.required]],
      telefono: ['', [Validators.required, Validators.minLength(12)]],
    });
  }

  /**
   * Función de registro público
   */
  Registrarse() {
    let campos = this.ObtenerFormGroup;
    let datos = {
      primerNombre: campos["primerNombre"].value,
      segundoNombre: campos["segundoNombre"].value,
      primerApellido: campos["primerApellido"].value,
      segundoApellido: campos["segundoApellido"].value,
      correo: campos["correo"].value,
      celular: campos["telefono"].value
    }
    this.servicioSeguridad.RegistrarUsuario(datos).subscribe({
      next: (respuesta:UsuarioModel) => {
        alert("Registro correcto, se ha enviado un mensaje para validar su dirección de correo electrónico.")
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
      },
      error: (err) => {
        console.log(err);
      }
    });
  }
  
  
  get ObtenerFormGroup(){
    return this.fGroup.controls;
  }

}
