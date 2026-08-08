import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeguridadService } from '../../servicios/seguridad.service';
import { CierreCajaService } from '../../servicios/ventas/cierre-caja.service';

import { CierreCajaModel } from '../../modelos/cierreCaja.model';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {
  mostrarModalBase: boolean = false;
  fGroup: FormGroup = new FormGroup({});
  cargando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private servicioSeguridad: SeguridadService,
    private cierreCajaService: CierreCajaService
  ) {}

  ngOnInit() {
    this.ConstruirFormulario();
    this.VerificarBaseCaja();
  }

  ConstruirFormulario() {
    this.fGroup = this.fb.group({
      Base: ['', [Validators.required, Validators.min(0)]]
    });
  }

  get ObtenerFormGroup() {
    return this.fGroup.controls;
  }

  VerificarBaseCaja() {
    const datosSesion = this.servicioSeguridad.ObtenerDatosUsuarioIdentificado();
    if (!datosSesion) return;

    // Verificar si el usuario tiene permiso para Cierre de Caja (idMenu '14')
    const itemsMenu = this.servicioSeguridad.ObtenerItemsEncabezado();
    const tienePermisoCierre = itemsMenu && itemsMenu.some(m => String(m.idMenu) === '14' || m.texto === 'Cierre de Caja');
    if (!tienePermisoCierre) {
      this.mostrarModalBase = false;
      return;
    }

    const hoy = new Date().toLocaleDateString('sv-SE', {timeZone: 'America/Bogota'});

    // Consultar en la base de datos si YA existe un cierre/base registrado para hoy
    this.cierreCajaService.ObtenerCierreDelDia(hoy).subscribe({
      next: (cierres: CierreCajaModel[]) => {
        if (cierres && cierres.length > 0) {
          // Ya existe un registro para hoy en la BD -> NO mostrar modal a nadie más hoy
          this.mostrarModalBase = false;
          if (cierres[0].id) {
            localStorage.setItem('cierre-caja-id', cierres[0].id.toString());
          }
        } else {
          // No existe ningún registro de hoy -> este es el primer usuario con permiso del día
          this.mostrarModalBase = true;
        }
      },
      error: (err) => {
        console.error('Error al verificar cierre del día:', err);
        this.mostrarModalBase = false;
      }
    });
  }

  RegistrarBase() {
    if (this.fGroup.invalid) {
      this.fGroup.markAllAsTouched();
      return;
    }
    this.cargando = true;
    const base = this.ObtenerFormGroup['Base'].value;
    const datos = {
      Base: base,
      NumeroArticulos: 0,
      TotalVentas: 0,
      MontoEsperado: 0,
      MontoReal: 0,
      Diferencia: 0,
      Estado: 'Abierto',
    };

    this.cierreCajaService.RegistrarCierreCaja(datos).subscribe({
      next: (respuesta: any) => {
        const hoyStr = new Date().toLocaleDateString('sv-SE', {timeZone: 'America/Bogota'});
        localStorage.setItem('fecha-base-caja', hoyStr);
        console.log('Respuesta del servicio:', respuesta);
        console.log('Hoy: ', hoyStr);
        if (respuesta && respuesta.id) {
          localStorage.setItem('cierre-caja-id', respuesta.id.toString());
        }
        this.mostrarModalBase = false;
        this.cargando = false;
      },
      error: (err: any) => {
        console.error(err);
        alert('Error al registrar la base de caja. Por favor intente de nuevo.');
        this.cargando = false;
      }
    });
  }
}
