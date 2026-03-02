import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InformacionModel } from '../../../modelos/informacion.model';
import { InfolocalModel } from '../../../modelos/infolocal.model';
import { AlmacenModel } from '../../../modelos/almacen.model';
import { InformacionService } from '../../../servicios/parametros/informacion.service';

@Component({
  selector: 'app-informacion',
  templateUrl: './informacion.component.html',
  styleUrl: './informacion.component.css'
})
export class InformacionComponent implements OnInit {

  // ─── Formularios ───────────────────────────────────────────────────────────
  fGroup: FormGroup = new FormGroup({});
  fAlmacen: FormGroup = new FormGroup({});

  // ─── Estado ────────────────────────────────────────────────────────────────
  esActualizacion = false;
  infoLocalId?: number;

  almacenes: AlmacenModel[] = [];
  almacenEditandoId?: number;

  constructor(
    private fb: FormBuilder,
    private servicioInformacion: InformacionService
  ) {}

  // ─── INIT ──────────────────────────────────────────────────────────────────
  ngOnInit() {
    this.ConstruirFormulario();
    this.ConstruirFormularioAlmacen();
    this.RefrescarTodo();
  }

  get ObtenerFormGroup() {
    return this.fGroup.controls;
  }

  // ─── SINCRONIZACIÓN GLOBAL (CLAVE) ─────────────────────────────────────────
  private RefrescarTodo() {
    this.servicioInformacion.ObtenerAlmacenes().subscribe({
      next: almacenes => {
        this.almacenes = almacenes ?? [];
        this.CargarInformacion(); // ⚠️ depende de almacenes
      },
      error: err => console.error('Error cargando almacenes:', err)
    });
  }

  // ─── FORMULARIO INFORMACIÓN ────────────────────────────────────────────────
  ConstruirFormulario() {
    this.fGroup = this.fb.group({
      Nombre:    ['', Validators.required],
      Direccion: ['', Validators.required],
      NIT:       ['', Validators.required],
      Iva:       ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      Mensaje:   [''],
      Telefono:  ['', Validators.required],
      Prefijo:   ['', Validators.required]
    });
  }

  CargarInformacion() {
    this.servicioInformacion.ObtenerInformacion().subscribe({
      next: (datos: InfolocalModel[]) => {
        if (!datos || datos.length === 0) return;

        const info = datos[0];
        this.esActualizacion = true;
        this.infoLocalId = info.id;

        const almacen = this.almacenes.find(a => a.id === info.almacenId);

        this.fGroup.patchValue({
          Nombre:    info.Nombre,
          Direccion: info.Direccion,
          NIT:       info.NIT,
          Iva:       info.Iva,
          Mensaje:   info.Mensaje,
          Telefono:  info.Telefono,
          Prefijo:   almacen?.Prefijo ?? ''
        });
      },
      error: err => console.error('Error cargando información:', err)
    });
  }

  GuardarInformacion() {
    if (this.fGroup.invalid) {
      this.fGroup.markAllAsTouched();
      return;
    }

    const c = this.ObtenerFormGroup;
    const datos: InformacionModel = {
      Nombre:    c['Nombre'].value,
      Direccion: c['Direccion'].value,
      NIT:       c['NIT'].value,
      Iva:       Number(c['Iva'].value),
      Mensaje:   c['Mensaje'].value,
      Telefono:  c['Telefono'].value,
      Prefijo:   c['Prefijo'].value
    };

    const accion = this.esActualizacion && this.infoLocalId
      ? this.servicioInformacion.ActualizarInformacion(this.infoLocalId, datos)
      : this.servicioInformacion.RegistrarInformacion(datos);

    accion.subscribe({
      next: (resp: any) => {
        alert('Información guardada correctamente');
        this.esActualizacion = true;
        this.infoLocalId = resp?.id ?? this.infoLocalId;
        this.RefrescarTodo();
      },
      error: err => this.manejarError(err)
    });
  }

  // ─── FORMULARIO ALMACÉN ────────────────────────────────────────────────────
  ConstruirFormularioAlmacen() {
    this.fAlmacen = this.fb.group({
      Nombre:  ['', Validators.required],
      Prefijo: ['', Validators.required]
    });
  }

  GuardarAlmacen() {
    if (this.fAlmacen.invalid) {
      this.fAlmacen.markAllAsTouched();
      return;
    }

    const datos: AlmacenModel = {
      Nombre:  this.fAlmacen.value.Nombre,
      Prefijo: this.fAlmacen.value.Prefijo
    };

    if (this.almacenEditandoId) {
      this.servicioInformacion.EditarAlmacen(this.almacenEditandoId, datos).subscribe({
        next: (actualizado: AlmacenModel) => {
          this.almacenes = this.almacenes.map(a =>
            a.id === actualizado.id ? actualizado : a
          );
          this.ResetFormularioAlmacen();
          this.RefrescarTodo();
        },
        error: err => this.manejarError(err)
      });
    } else {
      this.servicioInformacion.RegistrarAlmacen(datos).subscribe({
        next: (nuevo: AlmacenModel) => {
          this.almacenes = [...this.almacenes, nuevo];
          this.ResetFormularioAlmacen();
          this.RefrescarTodo();
        },
        error: err => this.manejarError(err)
      });
    }
  }

  EditarAlmacen(almacen: AlmacenModel) {
    this.almacenEditandoId = almacen.id;
    this.fAlmacen.patchValue({
      Nombre: almacen.Nombre,
      Prefijo: almacen.Prefijo
    });
  }

  EliminarAlmacen(id: number) {
    if (!confirm('¿Está seguro de eliminar este almacén?')) return;

    this.servicioInformacion.EliminarAlmacen(id).subscribe({
      next: () => {
        this.almacenes = this.almacenes.filter(a => a.id !== id);
        this.RefrescarTodo();
      },
      error: err => this.manejarError(err)
    });
  }

  CancelarEdicionAlmacen() {
    this.ResetFormularioAlmacen();
  }

  private ResetFormularioAlmacen() {
    this.almacenEditandoId = undefined;
    this.fAlmacen.reset();
  }

  // ─── UTILIDADES ────────────────────────────────────────────────────────────
  private manejarError(err: any) {
    alert(err?.error?.error?.message ?? 'Ocurrió un error inesperado');
    console.error(err);
  }

  focusNext(current: HTMLElement, next?: HTMLElement) {
    const name = current.id || current.getAttribute('formControlName') || '';
    if (this.fGroup.get(name)?.valid) {
      current.blur();
      next?.focus();
    } else {
      this.fGroup.get(name)?.markAsTouched();
      current.focus();
    }
  }

  focusNextAlmacen(event: Event, current: HTMLElement, next?: HTMLElement) {
    event.preventDefault();
    const name = current.getAttribute('formControlName') || '';
    if (this.fAlmacen.get(name)?.valid) {
      current.blur();
      next ? next.focus() : this.GuardarAlmacen();
    } else {
      this.fAlmacen.get(name)?.markAsTouched();
      current.focus();
    }
  }

  submitOrFocusNext(current: HTMLElement) {
    current.blur();
    this.fGroup.valid ? this.GuardarInformacion() : this.focusFirstInvalid();
  }

  private focusFirstInvalid() {
    for (const key in this.fGroup.controls) {
      if (this.fGroup.get(key)?.invalid) {
        document.getElementById(key)?.focus();
        break;
      }
    }
  }
}