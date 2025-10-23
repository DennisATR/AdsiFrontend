import { Component, ViewChild, OnInit } from '@angular/core';
import { ListarGastoComponent } from '../listar-gasto/listar-gasto.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GastoService } from '../../../../servicios/parametros/gasto.service';
import { GastoModel } from '../../../../modelos/gasto.model';
import { ConfiguracionListas } from '../../../../config/configuracion.listas';

@Component({
  selector: 'app-crear-gasto',
  templateUrl: './crear-gasto.component.html',
  styleUrl: './crear-gasto.component.css'
})
export class CrearGastoComponent implements OnInit {
  @ViewChild(ListarGastoComponent) listarGastoComponent!: ListarGastoComponent;
  fGroup: FormGroup = new FormGroup({});

  // Propiedades para el selector de conceptos inteligente
  ConceptoSearchQuery: string = '';
  conceptosFiltrados: string[] = [];
  showConceptoDropdown: boolean = false;
  selectedConceptoIndex: number = -1;
  conceptosComunes = ConfiguracionListas.conceptosGasto

  constructor(
    private fb: FormBuilder,
    private servicioGasto: GastoService
  ) {}

  ngOnInit() {
    this.ConstruirFormulario();
    this.conceptosFiltrados = [...this.conceptosComunes];
    this.establecerFechaActual();
  }

  get ObtenerFormGroup() {
    return this.fGroup.controls;
  }

  ConstruirFormulario() {
    this.fGroup = this.fb.group({
      Concepto: ['', [Validators.required]],
      Descripcion: [''], 
      Valor: ['', [Validators.required, Validators.min(0)]],
      Fecha: ['', [Validators.required]]
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

  RegistrarGasto() {
    let campos = this.ObtenerFormGroup;
    let datos = {
      Concepto: campos['Concepto'].value,
      Descripcion: campos['Descripcion'].value,
      Valor: parseFloat(campos['Valor'].value),
      Fecha: new Date(campos['Fecha'].value).toISOString()
    };
    
    console.log("Datos del gasto a registrar:", datos);

    this.servicioGasto.RegistrarGasto(datos).subscribe({
      next: (respuesta: GastoModel) => {
        alert('Gasto registrado correctamente');
        this.limpiarFormulario();
        if (this.listarGastoComponent) {
          this.listarGastoComponent.obtenerGastos();
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
      this.RegistrarGasto();
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