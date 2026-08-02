import { Component, ViewChild, OnInit } from '@angular/core';
import { ListarEntregaComponent } from '../listar-entrega/listar-entrega.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EntregaService } from '../../../../servicios/parametros/entrega.service';
import { EntregaModel } from '../../../../modelos/entrega.model';
import { ConfiguracionListas } from '../../../../config/configuracion.listas';

@Component({
  selector: 'app-crear-entrega',
  templateUrl: './crear-entrega.component.html',
  styleUrl: './crear-entrega.component.css'
})
export class CrearEntregaComponent implements OnInit {
  @ViewChild(ListarEntregaComponent) listarEntregaComponent!: ListarEntregaComponent;
  fGroup: FormGroup = new FormGroup({});

  // Propiedades para el selector de empresas transportadoras
  EmpresaTransSearchQuery: string = '';
  empresasFiltradas: string[] = [];
  showEmpresaDropdown: boolean = false;
  selectedEmpresaIndex: number = -1;
  empresasComunes = ConfiguracionListas.empresasTransporte;

  constructor(
    private fb: FormBuilder,
    private servicioEntrega: EntregaService
  ) {}

  ngOnInit() {
    this.ConstruirFormulario();
    this.empresasFiltradas = [...this.empresasComunes];
    this.establecerFechaActual();
  }

  get ObtenerFormGroup() {
    return this.fGroup.controls;
  }

  ConstruirFormulario() {
    this.fGroup = this.fb.group({
      NumeroGuia: ['', [Validators.required]],
      EmpresaTrans: ['', [Validators.required]],
      NumCajas: ['', [Validators.required, Validators.min(1)]],
      Cobro: ['', [Validators.required, Validators.min(0)]],
      Fecha: ['', [Validators.required]],
      Observacion: ['']
    });
  }

  establecerFechaActual(): void {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    const fechaFormateada = `${año}-${mes}-${dia}`;
    this.fGroup.get('Fecha')?.setValue(fechaFormateada);
  }

  RegistrarEntrega() {
    let campos = this.ObtenerFormGroup;
    let datos = {
      NumeroGuia: campos['NumeroGuia'].value,
      EmpresaTrans: campos['EmpresaTrans'].value,
      NumCajas: parseInt(campos['NumCajas'].value),
      Cobro: parseFloat(campos['Cobro'].value),
      Fecha: new Date(campos['Fecha'].value).toISOString().slice(0, 19).replace('T', ' '),
      Observacion: campos['Observacion'].value
    };
    
    console.log("Datos de la entrega a registrar:", datos);

    this.servicioEntrega.RegistrarEntrega(datos).subscribe({
      next: (respuesta: EntregaModel) => {
        alert('Entrega registrada correctamente');
        this.limpiarFormulario();
        if (this.listarEntregaComponent) {
          this.listarEntregaComponent.obtenerEntregas();
        }
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

  limpiarFormulario(): void {
    this.fGroup.reset();
    this.establecerFechaActual();
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
      this.RegistrarEntrega();
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