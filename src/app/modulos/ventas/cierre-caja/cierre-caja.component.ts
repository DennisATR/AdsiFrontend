import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { CierreCajaService } from '../../../servicios/ventas/cierre-caja.service';
import { CierreCajaModel } from '../../../modelos/cierreCaja.model';
import { GastoService } from '../../../servicios/parametros/gasto.service';
import { EntregaService } from '../../../servicios/parametros/entrega.service';

@Component({
  selector: 'app-cierre-caja',
  templateUrl: './cierre-caja.component.html',
  styleUrl: './cierre-caja.component.css'
})
export class CierreCajaComponent implements OnInit {
  fGroup: FormGroup = new FormGroup({});
  cierreCajaHoy: CierreCajaModel | null = null;
  cargando: boolean = false;
  cargandoReporte: boolean = false;

  totalGastosHoy: number = 0;
  totalEntregasHoy: number = 0;
  cargandoResumen: boolean = false;

  constructor(
    private fb: FormBuilder,
    private cierreCajaService: CierreCajaService,
    private gastoService: GastoService,
    private entregaService: EntregaService
  ) {}

  ngOnInit() {
    this.ConstruirFormulario();
    this.CargarCierreCajaHoy();
    this.CargarResumenDia();
  }

  get ObtenerFormGroup() {
    return this.fGroup.controls;
  }

  ConstruirFormulario() {
    this.fGroup = this.fb.group({
      Base: [null, [Validators.required, Validators.min(0)]],
      Entrega: [null, [Validators.min(0)]]
    });
  }

  CargarCierreCajaHoy() {
    const idStr = localStorage.getItem('cierre-caja-id');
    if (!idStr) return;
    this.cierreCajaService.BuscarCierreCaja(Number(idStr)).subscribe({
      next: (datos: CierreCajaModel) => {
        this.cierreCajaHoy = datos;
        this.fGroup.patchValue({
          Base: datos.Base ?? '',
          Entrega: (datos.Entrega !== undefined && datos.Entrega !== null && datos.Entrega !== 0)
            ? datos.Entrega
            : null
        });
      },
      error: (err: any) => {
        console.error('Error al cargar el cierre de caja:', err);
      }
    });
  }

  GuardarCierreCaja() {
    if (this.fGroup.invalid) {
      this.fGroup.markAllAsTouched();
      return;
    }
    const idStr = localStorage.getItem('cierre-caja-id');
    if (!idStr) {
      alert('No se encontró el cierre de caja del día.');
      return;
    }
    this.cargando = true;
    const baseVal = parseFloat(this.ObtenerFormGroup['Base'].value);
    const entregaVal = this.ObtenerFormGroup['Entrega'].value;
    const entrega = (entregaVal !== null && entregaVal !== '') ? parseFloat(entregaVal) : 0;
    this.cierreCajaService.EditarCierreCaja(Number(idStr), { Base: baseVal, Entrega: entrega }).subscribe({
      next: () => {
        this.cierreCajaHoy = { ...this.cierreCajaHoy, Base: baseVal, Entrega: entrega };
        alert('Cierre de caja guardado correctamente.');
        this.cargando = false;
      },
      error: (err: any) => {
        console.error(err);
        alert('Error al guardar el cierre de caja.');
        this.cargando = false;
      }
    });
  }

  CargarResumenDia() {
    this.cargandoResumen = true;
    const hoy = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Bogota' });
    forkJoin({
      gastos: this.gastoService.BuscarGastosPorFecha(hoy),
      entregas: this.entregaService.BuscarEntregasPorFecha(hoy)
    }).subscribe({
      next: ({ gastos, entregas }) => {
        this.totalGastosHoy = gastos.reduce((total, gasto) => total + (gasto.Valor ?? 0), 0);
        this.totalEntregasHoy = entregas.reduce((total, entrega) => total + (entrega.Cobro ?? 0), 0);
        this.cargandoResumen = false;
      },
      error: (err: any) => {
        console.error('Error al cargar el resumen del día:', err);
        this.cargandoResumen = false;
      }
    });
  }

  GenerarReporte() {
    // TODO: Generar reporte del día y cambiar Estado a 'Cerrado'
  }
}
