import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeguridadService } from '../../servicios/seguridad.service';
import { CierreCajaService } from '../../servicios/ventas/cierre-caja.service';

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
    const hoy = new Date().toLocaleDateString('sv-SE', {timeZone: 'America/Bogota'});
    const fechaGuardada = localStorage.getItem('fecha-base-caja');
    console.log('Datos de sesión:', datosSesion);
    console.log('Fecha guardada en localStorage:', fechaGuardada);
    console.log('Fecha actual formateada:', hoy);
    if (fechaGuardada !== hoy) {
      this.mostrarModalBase = true;
    }
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
