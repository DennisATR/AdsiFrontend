import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import html2pdf from 'html2pdf.js';
import { CierreCajaModel } from '../../../modelos/cierreCaja.model';
import { InfolocalModel } from '../../../modelos/infolocal.model';
import { ResumenDelDiaVentasModel } from '../../../modelos/resumenDelDiaVentas.model';
import { EntregaService } from '../../../servicios/parametros/entrega.service';
import { GastoService } from '../../../servicios/parametros/gasto.service';
import { InformacionService } from '../../../servicios/parametros/informacion.service';
import { CierreCajaService } from '../../../servicios/ventas/cierre-caja.service';
import { VentaService } from '../../../servicios/ventas/venta.service';
import { MetodoPagoService } from '../../../servicios/ventas/metodo-pago.service';
import { ResumenDelDiaGastosModel } from '../../../modelos/resumenDelDiaGastos.model';
import { ResumenDelDiaMetodoPagoModel } from '../../../modelos/resumenDelDiaMetodoPago.model';
import { ResumenDelDiaEntregasModel } from '../../../modelos/resumenDelDiaEntregas.model';
import { EfectivoEnCajaModel } from '../../../modelos/efectivoEnCaja.model';

@Component({
  selector: 'app-tirilla',
  templateUrl: './tirilla.component.html',
  styleUrl: './tirilla.component.css'
})
export class TirillaComponent implements OnInit {
  @ViewChild('tirillaContent') tirillaContent!: ElementRef;

  cargando: boolean = false;
  errorCarga: string = '';

  fechaConsulta: string = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Bogota' });
  fechaVista: string = new Date().toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: 'long',
    day: '2-digit'
  });

  infoLocal: InfolocalModel | null = null;
  cierreCajaHoy: CierreCajaModel | null = null;
  resumenDelDiaVentas: ResumenDelDiaVentasModel[] = [];
  resumenDelDiaGastos: ResumenDelDiaGastosModel[] = [];
  resumenDelDiaMetodoPago: ResumenDelDiaMetodoPagoModel[] = [];
  resumenDelDiaEntregas: ResumenDelDiaEntregasModel[] = []; 
  cierreCajaEfectivo: EfectivoEnCajaModel | null = null;

  totalGastosHoy: number = 0;
  totalEntregasHoy: number = 0;
  totalZapatosVendidosHoy: number = 0;

  constructor(
    private informacionService: InformacionService,
    private gastoService: GastoService,
    private entregaService: EntregaService,
    private ventaService: VentaService,
    private cierreCajaService: CierreCajaService,
    private metodoPagoService: MetodoPagoService
  ) {}

  ngOnInit(): void {
    this.CargarTirilla();
  }

  get TotalVentaResumen(): number {
    return this.resumenDelDiaVentas.reduce((total, item) => total + (item.valor ?? 0), 0);
  }

  get TotalGastosResumen(): number {
    return this.resumenDelDiaGastos.reduce((total, item) => total + (item.valor ?? 0), 0);
  }

  get TotalMetodoPagoResumen(): number {
    return this.resumenDelDiaMetodoPago.reduce((total, item) => total + (item.valor ?? 0), 0);
  }

  get TotalEntregasResumen(): number {
    return this.resumenDelDiaEntregas.reduce((total, item) => total + (item.cobro ?? 0), 0);
  }

  ExportarPDF(): void {
    if (!this.tirillaContent) return;

    const element = this.tirillaContent.nativeElement;
    const nombreArchivo = `Tirilla_${this.fechaConsulta}.pdf`;

    const opcionesPDF: any = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: nombreArchivo,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };

    html2pdf().set(opcionesPDF).from(element).save();
  }

  private CargarTirilla(): void {
    this.cargando = true;
    this.errorCarga = '';

    const cierreCajaId = localStorage.getItem('cierre-caja-id');
    const cierreCaja$ = cierreCajaId
      ? this.cierreCajaService.BuscarCierreCaja(Number(cierreCajaId))
      : of(null);

    forkJoin({
      informacion: this.informacionService.ObtenerInformacion(),
      gastos: this.gastoService.BuscarGastosPorFecha(this.fechaConsulta),
      entregas: this.entregaService.BuscarEntregasPorFecha(this.fechaConsulta),
      zapatosVendidos: this.ventaService.ObtenerCantidadZapatosVendidosPorFecha(this.fechaConsulta),
      resumen: this.ventaService.ObtenerResumenDelDia(this.fechaConsulta),
      resumenGastos: this.gastoService.ObtenerResumenDelDia(this.fechaConsulta),
      resumenMetodoPago: this.metodoPagoService.ObtenerResumenDelDia(this.fechaConsulta),
      cierreCaja: cierreCaja$,
      resumenEntregas: this.entregaService.ObtenerResumenDelDia(this.fechaConsulta),
      cierreCajaEfectivo: this.cierreCajaService.ObtenerCierreCajaPorFechaEfectivo(this.fechaConsulta)
    }).subscribe({
      next: ({ informacion, gastos, entregas, zapatosVendidos, resumen, resumenGastos, resumenMetodoPago, cierreCaja, resumenEntregas, cierreCajaEfectivo }) => {
        this.infoLocal = informacion?.[0] ?? null;
        this.cierreCajaHoy = cierreCaja;
        this.resumenDelDiaVentas = resumen ?? [];
        this.resumenDelDiaGastos = resumenGastos ?? [];
        this.resumenDelDiaMetodoPago = resumenMetodoPago ?? [];
        this.resumenDelDiaEntregas = resumenEntregas ?? [];
        this.cierreCajaEfectivo = cierreCajaEfectivo ?? null;
        this.totalGastosHoy = (gastos ?? []).reduce((total, gasto) => total + (gasto.Valor ?? 0), 0);
        this.totalEntregasHoy = (entregas ?? []).reduce((total, entrega) => total + (entrega.Cobro ?? 0), 0);
        this.totalZapatosVendidosHoy = zapatosVendidos?.cantidad ?? 0;
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error al cargar la previsualizacion de la tirilla:', error);
        this.errorCarga = 'No fue posible cargar la previsualizacion del reporte.';
        this.cargando = false;
      }
    });
  }

}
