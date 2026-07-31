import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfiguracionRutasBackend } from '../../../../config/configuracion.rutas.backend';
import { VendedorModel } from '../../../../modelos/vendedor.model';
import { ActivatedRoute, Router } from '@angular/router';
import { VendedorService } from '../../../../servicios/parametros/vendedor.service';

@Component({
  selector: 'app-editar-vendedor',
  templateUrl: './editar-vendedor.component.html',
  styleUrl: './editar-vendedor.component.css'
})
export class EditarVendedorComponent implements OnInit {
  BASE_URL: String = ConfiguracionRutasBackend.urlBackend;
  recordId: string = '';
  fgValidador!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private servicio: VendedorService,
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
      telefono: ['', [Validators.required, Validators.minLength(10)]],
      clave: ['', [Validators.minLength(6)]] // Optional in edit
    });
  }

  BuscarRegistro() {
    this.servicio.BuscarVendedor(this.recordId).subscribe({
      next: (datos: VendedorModel) => {
        this.fgValidador.patchValue({
          nombre: datos.Nombre,
          apellido: datos.Apellido,
          correo: datos.Correo,
          telefono: datos.Telefono
        });
      },
      error: (err) => {
        alert("El registro no existe.");
        this.router.navigate(['/parametros/vendedor/crear-vendedor']);
      }
    });
  }

  ActualizarRegistro() {
    if (this.fgValidador.invalid) {
      alert("Formulario inválido. Por favor complete todos los campos correctamente.");
      return;
    }

    let datos: any = {
      id : this.recordId,
      Nombre: this.fgValidador.controls['nombre'].value,
      Apellido: this.fgValidador.controls['apellido'].value,
      Correo: this.fgValidador.controls['correo'].value,
      Telefono: this.fgValidador.controls['telefono'].value,
      FechaReg: new Date()
    };

    if (this.fgValidador.controls['clave'].value) {
      datos.Clave = this.fgValidador.controls['clave'].value;
    }

    this.servicio.EditarVendedor(this.recordId, datos).subscribe({
      next: (data: any) => {
        alert("Información actualizada correctamente");
        this.router.navigate(['/parametros/vendedor/crear-vendedor']);
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
}