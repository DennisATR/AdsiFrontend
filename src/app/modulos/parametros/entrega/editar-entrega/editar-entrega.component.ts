import { Component, OnInit } from '@angular/core';
import { ConfiguracionRutasBackend } from '../../../../config/configuracion.rutas.backend';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EntregaService } from '../../../../servicios/parametros/entrega.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EntregaModel } from '../../../../modelos/entrega.model';
import { ConfiguracionListas } from '../../../../config/configuracion.listas';

@Component({
  selector: 'app-editar-entrega',
  templateUrl: './editar-entrega.component.html',
  styleUrl: './editar-entrega.component.css'
})
export class EditarEntregaComponent implements OnInit {
  BASE_URL: String = ConfiguracionRutasBackend.urlBackend;
  empresasdetransporte: string[] = ConfiguracionListas.empresasTransporte;
  recordId: number = 0;
  fgValidador!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private servicio: EntregaService,
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
      numeroGuia: ['', [Validators.required, Validators.minLength(2)]],
      empresaTrans: ['', [Validators.required, Validators.minLength(2)]],
      numCajas: ['', [Validators.required, Validators.min(1)]],
      cobro: ['', [Validators.required, Validators.min(0)]],
      fecha: ['', [Validators.required]],
      observacion: ['']
    });
  }

  BuscarRegistro() {
    this.servicio.BuscarEntrega(this.recordId).subscribe({
      next: (datos: EntregaModel) => {
        this.fgValidador.patchValue({
          numeroGuia: datos.NumeroGuia,
          empresaTrans: datos.EmpresaTrans,
          numCajas: datos.NumCajas,
          cobro: datos.Cobro,
          fecha: datos.Fecha ? new Date(datos.Fecha).toISOString().split('T')[0] : '',
          observacion: datos.Observacion
        });
      },
      error: (err) => {
        alert("El registro no existe.");
        this.router.navigate(['/entrega/listar-entrega']);
      }
    });
  }

  ActualizarRegistro() {
    if (this.fgValidador.invalid) {
      alert("Formulario inválido. Por favor complete todos los campos correctamente.");
      return;
    }

    let datos = {
      NumeroGuia: this.fgValidador.controls['numeroGuia'].value,
      EmpresaTrans: this.fgValidador.controls['empresaTrans'].value,
      NumCajas: this.fgValidador.controls['numCajas'].value,
      Cobro: this.fgValidador.controls['cobro'].value,
      Fecha: this.fgValidador.controls['fecha'].value ? new Date(this.fgValidador.controls['fecha'].value).toISOString().slice(0, 19).replace('T', ' ') : null,
      Observacion: this.fgValidador.controls['observacion'].value || ""
    };

    this.servicio.EditarEntrega(this.recordId, datos).subscribe({
      next: (data: any) => {
        alert("Información actualizada correctamente");
        this.router.navigate(['/parametros/entrega/crear-entrega']);
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

  // Getters para validaciones
  get numeroGuia() { return this.fgValidador.get('numeroGuia'); }
  get empresaTrans() { return this.fgValidador.get('empresaTrans'); }
  get numCajas() { return this.fgValidador.get('numCajas'); }
  get cobro() { return this.fgValidador.get('cobro'); }
  get fecha() { return this.fgValidador.get('fecha'); }
  get observacion() { return this.fgValidador.get('observacion'); }
}