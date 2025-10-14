import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProveedorModel } from '../../../../modelos/proveedor.model';
import { ListarProveedorComponent } from '../listar-proveedor/listar-proveedor.component';
import { ProveedorService } from '../../../../servicios/parametros/proveedor.service';
import { ConfiguracionListas} from '../../../../config/configuracion.listas';


@Component({
  selector: 'app-crear-proveedor',
  templateUrl: './crear-proveedor.component.html',
  styleUrls: ['./crear-proveedor.component.css']
})
export class CrearProveedorComponent {
  @ViewChild(ListarProveedorComponent) listarProveedorComponent!: ListarProveedorComponent;
  fGroup: FormGroup = new FormGroup({});

  // Propiedades para el selector de ciudades inteligente
  ciudadSearchQuery: string = '';
  ciudadesFiltradas: string[] = [];
  showCiudadDropdown: boolean = false;
  selectedCiudadIndex: number = -1;
  ciudadesComunes = ConfiguracionListas.ciudadesColombia

  constructor(
    private fb: FormBuilder,
    private servicioProveedor: ProveedorService
  ) {}

  ngOnInit() {
    this.ConstruirFormulario();
    
    // Inicializar ciudades filtradas
    this.ciudadesFiltradas = [...this.ciudadesComunes];
  }

  get ObtenerFormGroup() {
    return this.fGroup.controls;
  }

  ConstruirFormulario() {
    this.fGroup = this.fb.group({
      Nombre: ['', Validators.required],
      Empresa: ['', Validators.required],
      Telefono: ['', [Validators.required, Validators.pattern(/^\d{7,10}$/)]],
      Correo: ['', [Validators.required, Validators.email]],
      Ciudad: ['', Validators.required],
      NIT: ['', Validators.required],
    });
  }

  RegistrarProveedor() {
    let campos = this.ObtenerFormGroup;
    let datos: ProveedorModel = {
      Nombre: campos['Nombre'].value,
      Empresa: campos['Empresa'].value,
      Telefono: campos['Telefono'].value,
      Correo: campos['Correo'].value,
      Ciudad: campos['Ciudad'].value,
      NIT: campos['NIT'].value,
    };
    console.log("Datos del proveedor a registrar:", datos);

    this.servicioProveedor.RegistrarProveedor(datos).subscribe({
      next: (respuesta: ProveedorModel) => {
        alert('Proveedor registrado correctamente');
        this.listarProveedorComponent.obtenerProveedores();
        this.limpiarFormulario();
      },
      error: () => {
        alert('Error al registrar el proveedor');
      }
    });
  }

  /**
   * Limpia el formulario después de guardar exitosamente
   */
  limpiarFormulario(): void {
    this.fGroup.reset();
  }

  focusNext(currentField: HTMLElement, nextField?: HTMLElement) {
    if (this.fGroup.get(currentField.id)?.valid) {
      currentField.blur();
      if (nextField) {
        nextField.focus();
      }
    } else {
      currentField.focus();
      this.fGroup.get(currentField.id)?.markAsTouched();
    }
  }

  submitOrFocusNext(currentField: HTMLElement) {
    currentField.blur();
    if (this.fGroup.valid) {
      this.RegistrarProveedor();
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
