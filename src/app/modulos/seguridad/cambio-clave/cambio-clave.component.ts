import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeguridadService } from '../../../servicios/seguridad.service';

@Component({
  selector: 'app-cambio-clave',
  templateUrl: './cambio-clave.component.html',
  styleUrls: ['./cambio-clave.component.css'],
})
export class CambioClaveComponent implements OnInit {
  fGroup: FormGroup = new FormGroup({});

  constructor(private fb: FormBuilder, private servicioSeguridad: SeguridadService) {}

  ngOnInit() {
    this.fGroup = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      claveActual: ['', [Validators.required]],
      claveNueva: ['', [Validators.required]],
    });
  }

  CambiarClave() {
    if (this.fGroup.invalid) {
      alert('Debe ingresar los datos del usuario');
    } else {
      let datos = {
        correo: this.obtenerFormGroup['correo'].value,
        claveActual: this.obtenerFormGroup['claveActual'].value,
        claveNueva: this.obtenerFormGroup['claveNueva'].value,
      };

      this.servicioSeguridad.CambiarClave(datos).subscribe({
        next: () => {
          alert('Se ha cambiado la contraseña correctamente.');
        },
        error: (err) => {
          alert('Ha ocurrido un error cambiando la contraseña.');
          console.log(err);
        },
      });
    }
  }

  get obtenerFormGroup() {
    return this.fGroup.controls;
  }

  // Método para enfocar el siguiente campo
  focusNext(currentField: HTMLElement, nextField?: HTMLElement) {
    currentField.blur(); // Quita el foco actual
    if (nextField) {
      nextField.focus(); // Mueve el foco al siguiente campo
    }
  }

  // Método para enviar el formulario si está válido o mantener el foco
  submitOrFocusNext(currentField: HTMLElement) {
    currentField.blur();
    if (this.fGroup.valid) {
      this.CambiarClave();
    } else {
      currentField.focus();
    }
  }
}
