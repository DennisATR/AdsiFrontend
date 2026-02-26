import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InformacionModel } from '../../../modelos/informacion.model';
import { AlmacenModel } from '../../../modelos/almacen.model';
import { InformacionService } from '../../../servicios/parametros/informacion.service';

@Component({
  selector: 'app-informacion',
  templateUrl: './informacion.component.html',
  styleUrl: './informacion.component.css'
})
export class InformacionComponent implements OnInit {
  // Formulario información
  fGroup: FormGroup = new FormGroup({});
  esActualizacion: boolean = false;
  infoLocalId?: number;

  // Formulario almacén
  fAlmacen: FormGroup = new FormGroup({});
  almacenes: AlmacenModel[] = [];
  almacenEditandoId?: number;

  constructor(
    private fb: FormBuilder,
    private servicioInformacion: InformacionService
  ) {}

  ngOnInit() {
    this.ConstruirFormulario();
    this.ConstruirFormularioAlmacen();
    this.CargarInformacion();
    this.CargarAlmacenes();
  }

  get ObtenerFormGroup() {
    return this.fGroup.controls;
  }

  // ─── Información del negocio ───────────────────────────────────────────────

  ConstruirFormulario() {
    this.fGroup = this.fb.group({
      Nombre:    ['', [Validators.required]],
      Direccion: ['', [Validators.required]],
      NIT:       ['', [Validators.required]],
      Iva:       ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      Mensaje:   [''],
      Telefono:  ['', [Validators.required]]
    });
  }

  CargarInformacion() {
    this.servicioInformacion.ObtenerInformacion().subscribe({
      next: (datos: InformacionModel[]) => {
        if (datos && datos.length > 0) {
          const info = datos[0];
          this.esActualizacion = true;
          this.infoLocalId = info.id;
          this.fGroup.patchValue({
            Nombre:    info.Nombre,
            Direccion: info.Direccion,
            NIT:       info.NIT,
            Iva:       info.Iva,
            Mensaje:   info.Mensaje,
            Telefono:  info.Telefono
          });
        }
      },
      error: (err: any) => console.error('Error al cargar información:', err)
    });
  }

  GuardarInformacion() {
    if (this.fGroup.invalid) {
      this.fGroup.markAllAsTouched();
      return;
    }

    const campos = this.ObtenerFormGroup;
    const datos: InformacionModel = {
      Nombre:    campos['Nombre'].value,
      Direccion: campos['Direccion'].value,
      NIT:       campos['NIT'].value,
      Iva:       parseFloat(campos['Iva'].value),
      Mensaje:   campos['Mensaje'].value,
      Telefono:  campos['Telefono'].value
    };

    if (this.esActualizacion && this.infoLocalId) {
      this.servicioInformacion.ActualizarInformacion(this.infoLocalId, datos).subscribe({
        next: () => alert('Información actualizada correctamente'),
        error: (err: any) => this.manejarError(err)
      });
    } else {
      this.servicioInformacion.RegistrarInformacion(datos).subscribe({
        next: (respuesta: InformacionModel) => {
          alert('Información registrada correctamente');
          this.esActualizacion = true;
          this.infoLocalId = respuesta.id;
        },
        error: (err: any) => this.manejarError(err)
      });
    }
  }

  // ─── Almacenes ─────────────────────────────────────────────────────────────

  ConstruirFormularioAlmacen() {
    this.fAlmacen = this.fb.group({
      Nombre:  ['', [Validators.required]],
      Prefijo: ['', [Validators.required]]
    });
  }

  CargarAlmacenes() {
    this.servicioInformacion.ObtenerAlmacenes().subscribe({
      next: (datos: AlmacenModel[]) => {
        this.almacenes = datos ?? [];
      },
      error: (err: any) => console.error('Error al cargar almacenes:', err)
    });
  }

  GuardarAlmacen() {
    if (this.fAlmacen.invalid) {
      this.fAlmacen.markAllAsTouched();
      return;
    }

    const datos: AlmacenModel = {
      Nombre:  this.fAlmacen.get('Nombre')?.value,
      Prefijo: this.fAlmacen.get('Prefijo')?.value
    };

    if (this.almacenEditandoId) {
      this.servicioInformacion.EditarAlmacen(this.almacenEditandoId, datos).subscribe({
        next: () => {
          alert('Almacén actualizado correctamente');
          this.ResetFormularioAlmacen();
          this.CargarAlmacenes();
        },
        error: (err: any) => this.manejarError(err)
      });
    } else {
      this.servicioInformacion.RegistrarAlmacen(datos).subscribe({
        next: () => {
          alert('Almacén registrado correctamente');
          this.ResetFormularioAlmacen();
          this.CargarAlmacenes();
        },
        error: (err: any) => this.manejarError(err)
      });
    }
  }

  EditarAlmacen(almacen: AlmacenModel) {
    this.almacenEditandoId = almacen.id;
    this.fAlmacen.patchValue({
      Nombre:  almacen.Nombre,
      Prefijo: almacen.Prefijo
    });
  }

  EliminarAlmacen(id: number) {
    if (!confirm('¿Está seguro de eliminar este almacén?')) return;
    this.servicioInformacion.EliminarAlmacen(id).subscribe({
      next: () => {
        alert('Almacén eliminado correctamente');
        this.CargarAlmacenes();
      },
      error: (err: any) => this.manejarError(err)
    });
  }

  CancelarEdicionAlmacen() {
    this.ResetFormularioAlmacen();
  }

  private ResetFormularioAlmacen() {
    this.almacenEditandoId = undefined;
    this.fAlmacen.reset();
  }

  // ─── Utilidades ────────────────────────────────────────────────────────────

  private manejarError(err: any) {
    if (err.error?.error?.message) {
      alert(err.error.error.message);
    } else {
      alert('Ocurrió un error inesperado.');
    }
    console.error('Error:', err);
  }

  focusNext(currentField: HTMLElement, nextField?: HTMLElement) {
    const fieldName = currentField.id || currentField.getAttribute('formControlName') || '';
    if (this.fGroup.get(fieldName)?.valid) {
      currentField.blur();
      if (nextField) nextField.focus();
    } else {
      currentField.focus();
      this.fGroup.get(fieldName)?.markAsTouched();
    }
  }

  focusNextAlmacen(event: Event, currentField: HTMLElement, nextField?: HTMLElement) {
    event.preventDefault();
    const fieldName = currentField.id?.replace('Almacen', '') || currentField.getAttribute('formControlName') || '';
    if (this.fAlmacen.get(fieldName)?.valid) {
      currentField.blur();
      if (nextField) {
        nextField.focus();
      } else if (this.fAlmacen.valid) {
        this.GuardarAlmacen();
      }
    } else {
      currentField.focus();
      this.fAlmacen.get(fieldName)?.markAsTouched();
    }
  }

  submitOrFocusNext(currentField: HTMLElement) {
    currentField.blur();
    if (this.fGroup.valid) {
      this.GuardarInformacion();
    } else {
      for (const controlName in this.fGroup.controls) {
        const control = this.fGroup.get(controlName);
        if (control && control.invalid) {
          const invalidField = document.getElementById(controlName);
          if (invalidField) invalidField.focus();
          break;
        }
      }
    }
  }
}