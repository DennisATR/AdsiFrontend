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
import { DialogService } from '../../../servicios/dialog.service';
import { PrintService } from '../../../servicios/ventas/print.service';

const STORAGE_KEY_LUGAR_IMPRESION = 'tirilla-lugar-impresion';

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

  // Modal cierre de caja
  modalCierreCajaVisible: boolean = false;
  montoReal: number | null = null;
  valorADejar: number = 0;
  guardandoCierre: boolean = false;

  /** Preferencia de destino de impresión, persistida en localStorage. */
  lugarImpresion: string = 'cliente';

  constructor(
    private informacionService: InformacionService,
    private gastoService: GastoService,
    private entregaService: EntregaService,
    private ventaService: VentaService,
    private cierreCajaService: CierreCajaService,
    private metodoPagoService: MetodoPagoService,
    private dialogService: DialogService,
    private printService: PrintService
  ) {}

  ngOnInit(): void {
    this.lugarImpresion = localStorage.getItem(STORAGE_KEY_LUGAR_IMPRESION) ?? 'cliente';
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

  /** Persiste el lugar de impresión seleccionado en localStorage. */
  guardarLugarImpresion(): void {
    localStorage.setItem(STORAGE_KEY_LUGAR_IMPRESION, this.lugarImpresion);
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

  /**
   * Imprime manualmente la tirilla del cierre actual.
   * Requiere que haya un cierre de caja cargado con ID válido.
   */
  ImprimirTirilla(): void {
    const idStr = localStorage.getItem('cierre-caja-id');
    if (!idStr) {
      this.dialogService.mostrar('No se encontró el ID del cierre de caja para imprimir.', 'error');
      return;
    }
    this.procesarImpresionCierreCaja(Number(idStr));
  }

  AbrirModalCierreCaja(): void {
    this.montoReal = null;
    this.valorADejar = 0;
    this.modalCierreCajaVisible = true;
  }

  CerrarModalCierreCaja(): void {
    if (this.guardandoCierre) return;
    this.modalCierreCajaVisible = false;
  }

  RecalcularValorADejar(): void {
    const monto = this.montoReal ?? 0;
    const entrega = this.cierreCajaHoy?.Entrega ?? 0;
    this.valorADejar = monto - entrega;
  }

  GuardarCierreCaja(): void {
    const idStr = localStorage.getItem('cierre-caja-id');
    if (!idStr) {
      this.dialogService.mostrar('No se encontró el ID del cierre de caja.', 'error');
      return;
    }
    if (this.montoReal === null || this.montoReal === undefined) {
      this.dialogService.mostrar('Por favor ingresa el monto real en caja.', 'warning');
      return;
    }

    this.dialogService.confirmar('¿Está seguro de cerrar la caja? Este movimiento se notificará inmediatamente a los gerentes.').then((confirmado) => {
      if (!confirmado) return;

      const cierreId = Number(idStr);
      const montoReal = Number(this.montoReal);
      const esperado = this.cierreCajaEfectivo?.efectivoEnCaja ?? 0;
      const diferencia = montoReal - esperado;
      const entrega = this.cierreCajaHoy?.Entrega ?? 0;
      const quedaEnCaja = montoReal - entrega;
      const totalVentas = this.cierreCajaEfectivo?.ventasEfectivo ?? 0;
      const numeroArticulos = this.totalZapatosVendidosHoy;
      const fechaHoraCierre = new Date().toLocaleString('sv-SE', { timeZone: 'America/Bogota' });

      this.guardandoCierre = true;
      this.cierreCajaService.EditarCierreCaja(cierreId, {
        MontoReal: montoReal,
        Diferencia: diferencia,
        Caja: quedaEnCaja,
        Estado: 'Cerrada',
        MontoEsperado: esperado,
        TotalVentas: totalVentas,
        NumeroArticulos: numeroArticulos,
        FechaHoraCierre: fechaHoraCierre
      }).subscribe({
        next: () => {
          this.guardandoCierre = false;
          this.modalCierreCajaVisible = false;
          this.cierreCajaHoy = {
            ...this.cierreCajaHoy,
            MontoReal: montoReal,
            Diferencia: diferencia,
            Caja: quedaEnCaja,
            Estado: 'Cerrada',
            MontoEsperado: esperado,
            TotalVentas: totalVentas,
            NumeroArticulos: numeroArticulos,
            FechaHoraCierre: fechaHoraCierre
          };
          this.dialogService.mostrar('El cierre de caja ha sido registrado correctamente.', 'success').then(() => {
            // Imprimir la tirilla automáticamente tras confirmar el cierre
            this.procesarImpresionCierreCaja(cierreId);
          });
        },
        error: (err: any) => {
          console.error('Error al guardar el cierre de caja:', err);
          this.guardandoCierre = false;
          this.dialogService.mostrar('No fue posible guardar el cierre de caja.', 'error');
        }
      });
    });
  }

  /**
   * Decide si imprimir en el agente local (PC del usuario) o directamente en el servidor.
   * Sigue el mismo patrón que la impresión de facturas.
   */
  procesarImpresionCierreCaja(cierreId: number): void {
    if (this.lugarImpresion === 'cliente') {
      this.printService.obtenerBufferCierreCaja(cierreId).subscribe({
        next: (res) => {
          this.printService.imprimirLocal(res.buffer).subscribe({
            next: () => {
              console.log('Tirilla de cierre enviada al agente local');
            },
            error: () => {
              this.dialogService.mostrar(
                'No se pudo comunicar con el agente de impresión local. Asegúrate de que el script se está ejecutando.',
                'error'
              );
            }
          });
        },
        error: (err) => {
          console.error('Error al obtener buffer de cierre:', err);
          this.dialogService.mostrar('Error al obtener los datos de impresión del cierre de caja.', 'error');
        }
      });
    } else {
      // Impresión en la impresora conectada al servidor
      this.cierreCajaService.ImprimirCierreCajaServidor(cierreId).subscribe({
        next: () => {
          console.log('Tirilla de cierre enviada al servidor');
        },
        error: (err) => {
          console.error('Error al imprimir tirilla en servidor:', err);
          this.dialogService.mostrar('Error al imprimir la tirilla en el servidor. El cierre quedó registrado.', 'error');
        }
      });
    }
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
