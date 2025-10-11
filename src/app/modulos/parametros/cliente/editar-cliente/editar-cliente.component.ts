import { Component } from '@angular/core';
import { ConfiguracionRutasBackend } from '../../../../config/configuracion.rutas.backend';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClienteService } from '../../../../servicios/parametros/cliente.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteModel } from '../../../../modelos/cliente.model';

@Component({
  selector: 'app-editar-cliente',
  templateUrl: './editar-cliente.component.html',
  styleUrl: './editar-cliente.component.css'
})
export class EditarClienteComponent {
  BASE_URL: String = ConfiguracionRutasBackend.urlBackend;
  recordId: number = 0;
  fgValidador!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private servicio: ClienteService,
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
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      identificacion: [''],
      telefono: [''],
      correo: ['', [Validators.email]],
      ciudad: ['', [Validators.required]],
      barrio: [''],
      fechaNac: ['']
    });
  }

  BuscarRegistro() {
    this.servicio.BuscarCliente(this.recordId).subscribe({
      next: (datos: ClienteModel) => {
        this.fgValidador.patchValue({
          nombre: datos.Nombre,
          apellido: datos.Apellido,
          identificacion: datos.Identificacion,
          telefono: datos.Telefono,
          correo: datos.Correo,
          ciudad: datos.Ciudad,
          barrio: datos.Barrio,
          fechaNac: datos.FechaNac ? new Date(datos.FechaNac).toISOString().split('T')[0] : ''
        });
      },
      error: (err) => {
        alert("El registro no existe.");
        this.router.navigate(['/parametros/cliente/listar-cliente']);
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
      Apellido: this.fgValidador.controls['apellido'].value,
      Identificacion: this.fgValidador.controls['identificacion'].value || "",
      Telefono: this.fgValidador.controls['telefono'].value || "",
      Correo: this.fgValidador.controls['correo'].value || "",
      Ciudad: this.fgValidador.controls['ciudad'].value,
      Barrio: this.fgValidador.controls['barrio'].value || "",
      FechaNac: this.fgValidador.controls['fechaNac'].value ? new Date(this.fgValidador.controls['fechaNac'].value).toISOString() : null
    };

    this.servicio.EditarCliente(this.recordId, datos).subscribe({
      next: (data: any) => {
        alert("Información actualizada correctamente");
        this.router.navigate(['/parametros/cliente/crear-cliente']);
      },
      error: (err: any) => {
        alert("Ha ocurrido un error al actualizar");
        console.error('Error:', err);
      }
    });
  }

  // Métodos para validaciones
  get nombre() { return this.fgValidador.get('nombre'); }
  get apellido() {return this.fgValidador.get('apellido')}
  get identificacion() { return this.fgValidador.get('identificacion'); }
  get telefono() { return this.fgValidador.get('telefono'); }
  get correo() { return this.fgValidador.get('correo'); }
  get ciudad() { return this.fgValidador.get('ciudad'); }
  get barrio(){return this.fgValidador.get('barrio')}
  get fechaNac() { return this.fgValidador.get('fechaNac'); }
}
