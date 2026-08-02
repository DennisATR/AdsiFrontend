import { Component, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VendedorService } from '../../../../servicios/parametros/vendedor.service';
import { DialogService } from '../../../../servicios/dialog.service';
import { VendedorModel } from '../../../../modelos/vendedor.model';
import { ListarVendedorComponent } from '../listar-vendedor/listar-vendedor.component';

@Component({
  selector: 'app-crear-vendedor',
  templateUrl: './crear-vendedor.component.html',
  styleUrl: './crear-vendedor.component.css'
})
export class CrearVendedorComponent implements OnInit {
  @ViewChild(ListarVendedorComponent) listarVendedorComponent!: ListarVendedorComponent;

  fGroup: FormGroup = new FormGroup({});

  constructor(
    private fb: FormBuilder,
    private servicioVendedor: VendedorService,
    private dialogService: DialogService
  ) { }

  ngOnInit() {
    this.ConstruirFormulario();
  }

  ConstruirFormulario() {
    this.fGroup = this.fb.group({
      Nombre: ['', [Validators.required, Validators.minLength(2)]],
      Apellido: ['', [Validators.required, Validators.minLength(2)]],
      Correo: ['', [Validators.required, Validators.email]],
      Telefono: ['', [Validators.required, Validators.minLength(10)]],
      Clave: ['', [Validators.required]],
    });
  }

  Registrarse() {
    let campos = this.ObtenerFormGroup;

    let datos = {
      Nombre: campos['Nombre'].value,
      Apellido: campos['Apellido'].value,
      Correo: campos['Correo'].value,
      Telefono: campos['Telefono'].value,
      Clave: campos['Clave'].value
    };

    this.servicioVendedor.RegistrarVendedor(datos).subscribe({
      next: (respuesta: VendedorModel) => {
        if (respuesta.radiusUser && respuesta.radiusClave) {
          this.dialogService.mostrarWifi('Vendedor registrado correctamente.', respuesta.radiusUser, respuesta.radiusClave);
        } else {
          this.dialogService.mostrar('Vendedor registrado correctamente.', 'success');
        }
        if (this.listarVendedorComponent) {
          this.listarVendedorComponent.obtenerVendedores();
        }
        this.limpiarFormulario();
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

  get ObtenerFormGroup() {
    return this.fGroup.controls;
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
      this.Registrarse();
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