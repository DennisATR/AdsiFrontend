import { Component } from '@angular/core';
import { ConfiguracionRutasBackend } from '../../../../config/configuracion.rutas.backend';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GastoService } from '../../../../servicios/parametros/gasto.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GastoModel } from '../../../../modelos/gasto.model';

@Component({
  selector: 'app-editar-gasto',
  templateUrl: './editar-gasto.component.html',
  styleUrl: './editar-gasto.component.css'
})
export class EditarGastoComponent {
 BASE_URL: String = ConfiguracionRutasBackend.urlBackend;
  recordId: number = 0;
  fgValidador!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private servicio: GastoService,
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
      concepto: ['', [Validators.required]],
      descripcion: [''],
      valor: ['', [Validators.required, Validators.min(0)]],
      fecha: ['', [Validators.required]]
    });
  }

  BuscarRegistro() {
    this.servicio.BuscarGasto(this.recordId).subscribe({
      next: (datos: GastoModel) => {
        this.fgValidador.patchValue({
          concepto: datos.Concepto,
          descripcion: datos.Descripcion,
          valor: datos.Valor,
          fecha: datos.Fecha ? new Date(datos.Fecha).toISOString().split('T')[0] : ''
        });
      },
      error: (err) => {
        alert("El registro no existe.");
        this.router.navigate(['/parametros/gasto/listar-gasto']);
      }
    });
  }

  ActualizarRegistro() {
    if (this.fgValidador.invalid) {
      alert("Formulario inválido. Por favor complete todos los campos correctamente.");
      return;
    }

    let datos = {
      Concepto: this.fgValidador.controls['concepto'].value,
      Valor: this.fgValidador.controls['valor'].value,
      Fecha: this.fgValidador.controls['fecha'].value ? new Date(this.fgValidador.controls['fecha'].value).toISOString() : null,
      Descripcion: this.fgValidador.controls['descripcion'].value || ""
    };

    this.servicio.EditarGasto(this.recordId, datos).subscribe({
      next: (data: any) => {
        alert("Información actualizada correctamente");
        this.router.navigate(['/parametros/gasto/crear-gasto']);
      },
      error: (err: any) => {
        alert("Ha ocurrido un error al actualizar");
        console.error('Error:', err);
      }
    });
  }

  // Métodos para validaciones
  get concepto() { return this.fgValidador.get('concepto'); }
  get valor() { return this.fgValidador.get('valor'); } 
  get fecha() { return this.fgValidador.get('fecha'); }
  get descripcion() { return this.fgValidador.get('descripcion'); }
}

