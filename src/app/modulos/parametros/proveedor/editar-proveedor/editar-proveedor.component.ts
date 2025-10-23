import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfiguracionRutasBackend } from '../../../../config/configuracion.rutas.backend';
import { ProveedorModel } from '../../../../modelos/proveedor.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ProveedorService } from '../../../../servicios/parametros/proveedor.service';
import { ConfiguracionListas } from '../../../../config/configuracion.listas';

@Component({
  selector: 'app-editar-proveedor',
  templateUrl: './editar-proveedor.component.html',
  styleUrl: './editar-proveedor.component.css'
})
export class EditarProveedorComponent implements OnInit {
  BASE_URL: String = ConfiguracionRutasBackend.urlBackend;
  recordId: number = 0;
  fgValidador!: FormGroup;
  ciudadesComunes = ConfiguracionListas.ciudadesColombia

  constructor(
    private fb: FormBuilder,
    private servicio: ProveedorService,
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
      empresa: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      ciudad: ['', [Validators.required]],
      nit: ['', [Validators.required]]
    });
  }

  BuscarRegistro() {
    this.servicio.BuscarProveedor(this.recordId).subscribe({
      next: (datos: ProveedorModel) => {
        this.fgValidador.patchValue({
          nombre: datos.Nombre,
          empresa: datos.Empresa,
          telefono: datos.Telefono,
          correo: datos.Correo,
          ciudad: datos.Ciudad,
          nit: datos.NIT
        });
      },
      error: (err) => {
        alert("El registro no existe.");
        this.router.navigate(['/parametros/proveedor/listar-proveedor']);
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
      Empresa: this.fgValidador.controls['empresa'].value,
      Telefono: this.fgValidador.controls['telefono'].value,
      Correo: this.fgValidador.controls['correo'].value,
      Ciudad: this.fgValidador.controls['ciudad'].value,
      NIT: this.fgValidador.controls['nit'].value
    };

    this.servicio.EditarProveedor(this.recordId, datos).subscribe({
      next: (data: any) => {
        alert("Información actualizada correctamente");
        this.router.navigate(['/parametros/proveedor/crear-proveedor']);
      },
      error: (err: any) => {
        if (err.error && err.error.error && err.error.error.message) {
          alert(err.error.error.message);
        } else {
          alert('Ocurrió un error inesperado.');
        }
        console.error('Error:', err);
      }
    });
  }

  // Métodos para validaciones
  get nombre() { return this.fgValidador.get('nombre'); }
  get empresa() { return this.fgValidador.get('empresa'); }
  get telefono() { return this.fgValidador.get('telefono'); }
  get correo() { return this.fgValidador.get('correo'); }
  get ciudad() { return this.fgValidador.get('ciudad'); }
  get nit() { return this.fgValidador.get('nit'); }
}