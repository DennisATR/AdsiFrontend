import { Component, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClienteModel } from '../../../../modelos/cliente.model';
import { ConfiguracionPaginacion } from '../../../../config/configuracion.paginacion';
import { ListarClienteComponent } from '../listar-cliente/listar-cliente.component';
import { ClienteService } from '../../../../servicios/parametros/cliente.service';
import { ConfiguracionListas } from '../../../../config/configuracion.listas';

@Component({
  selector: 'app-crear-cliente',
  templateUrl: './crear-cliente.component.html',
  styleUrl: './crear-cliente.component.css'
})
export class CrearClienteComponent implements OnInit {
  @ViewChild(ListarClienteComponent) listarClienteComponent!: ListarClienteComponent;

  fGroup: FormGroup = new FormGroup({});
  clientes: ClienteModel[] = [];
  clientesFiltrados: ClienteModel[] = [];
  searchQuery: string = '';
  pag = 1;
  total = 0;
  totalItems = 0;
  registrosPorPagina = ConfiguracionPaginacion.registrosPorPagina;
  ciudadesComunes = ConfiguracionListas.ciudadesColombia;
  ciudadesFiltradas: string[] = [];

  constructor(
    private fb: FormBuilder,
    private servicioCliente: ClienteService
  ) { }

  ngOnInit() {
    this.ConstruirFormulario();
    this.ciudadesFiltradas = [...this.ciudadesComunes];
  }

  get ObtenerFormGroup() {
    return this.fGroup.controls;
  }

  ConstruirFormulario() {
    this.fGroup = this.fb.group({
      Nombre: ['', [Validators.required, Validators.minLength(2)]],
      Apellido: ['', [Validators.required, Validators.minLength(2)]],
      Ciudad: ['', [Validators.required]],
      Barrio: [''],
      Correo: ['', [Validators.email]],
      Telefono: ['', [Validators.minLength(7), Validators.maxLength(10)]],
      FechaNac: [''],
      Identificacion: ['', [Validators.required]]
    });
  }

  RegistrarCliente() {
    let campos = this.ObtenerFormGroup;
    let datos: any = {
      Nombre: campos["Nombre"].value,
      Apellido: campos["Apellido"].value,
      Identificacion: campos["Identificacion"].value || "",
      Ciudad: campos["Ciudad"].value,
      Barrio: campos["Barrio"].value || "",
      Correo: campos["Correo"].value || "",
      Telefono: campos["Telefono"].value || "",
    };
    if (campos["FechaNac"].value) {
      datos.FechaNac = new Date(campos["FechaNac"].value).toISOString();
    }

    this.servicioCliente.RegistrarCliente(datos).subscribe({
      next: (respuesta: ClienteModel) => {
        alert("Cliente registrado correctamente");
        this.limpiarFormulario();
        if (this.listarClienteComponent) {
          this.listarClienteComponent.obtenerClientes();
        }
      },
      error: (err) => {
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
      this.RegistrarCliente();
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