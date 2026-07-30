import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { CierreCajaService } from '../../../servicios/ventas/cierre-caja.service';
import { CierreCajaModel } from '../../../modelos/cierreCaja.model';
import { GastoService } from '../../../servicios/parametros/gasto.service';
import { EntregaService } from '../../../servicios/parametros/entrega.service';
import { VentaService } from '../../../servicios/ventas/venta.service';
import { Router } from '@angular/router';

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
  totalZapatosVendidosHoy: number = 0;
  cargandoResumen: boolean = false;

  constructor(
    private fb: FormBuilder,
    private cierreCajaService: CierreCajaService,
    private gastoService: GastoService,
    private entregaService: EntregaService,
    private ventaService: VentaService,
    private router: Router
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
      entregas: this.entregaService.BuscarEntregasPorFecha(hoy),
      zapatosVendidos: this.ventaService.ObtenerCantidadZapatosVendidosPorFecha(hoy)
    }).subscribe({
      next: ({ gastos, entregas, zapatosVendidos }) => {
        this.totalGastosHoy = gastos.reduce((total, gasto) => total + (gasto.Valor ?? 0), 0);
        this.totalEntregasHoy = entregas.reduce((total, entrega) => total + (entrega.Cobro ?? 0), 0);
        this.totalZapatosVendidosHoy = zapatosVendidos.cantidad ?? 0;
        this.cargandoResumen = false;
      },
      error: (err: any) => {
        console.error('Error al cargar el resumen del día:', err);
        this.totalZapatosVendidosHoy = 0;
        this.cargandoResumen = false;
      }
    });
  }

  GenerarReporte() {
    this.cargandoReporte = true;
    this.router.navigate(['/ventas/tirilla'])
      .finally(() => {
        this.cargandoReporte = false;
      });
  }

  ExportarCSV() {
    const hoy = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Bogota' });
    this.ventaService.ExportarVentasDia(hoy).subscribe({
      next: (ventas: any[]) => {
        if (!ventas || ventas.length === 0) {
          alert('No hay ventas registradas para hoy.');
          return;
        }

        // Agrupar ventas por almacén o virtuales
        const grupos: { [key: string]: any[] } = {};

        ventas.forEach(venta => {
          let grupo = 'Virtuales';
          if (!venta.esVirtual && venta.almacen && venta.almacen.Nombre) {
            grupo = venta.almacen.Nombre;
          }
          if (!grupos[grupo]) {
            grupos[grupo] = [];
          }
          grupos[grupo].push(venta);
        });

        // Generar y descargar un CSV por cada grupo
        Object.keys(grupos).forEach(grupo => {
          const ventasGrupo = grupos[grupo];
          let csvContent = "data:text/csv;charset=utf-8,";
          csvContent += "Codigo Zapato,Cantidad,Valor Venta,Fecha de Venta\n";

          ventasGrupo.forEach(v => {
            const codigo = v.esVirtual ? (v.codigoVirtual || 'VIRTUAL') : (v.zapatoId || '');
            const cantidad = v.Cantidad || 0;
            const precio = v.Precio || 0;
            const fecha = v.factura?.Fecha ? new Date(v.factura.Fecha).toLocaleString('es-CO') : '';
            csvContent += `${codigo},${cantidad},${precio},${fecha}\n`;
          });

          const encodedUri = encodeURI(csvContent);
          const link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          const nombreArchivo = `Ventas_${grupo.replace(/\s+/g, '_')}_${hoy}.csv`;
          link.setAttribute("download", nombreArchivo);
          document.body.appendChild(link); // Required for FF
          
          link.click();
          document.body.removeChild(link);
        });
      },
      error: (err: any) => {
        console.error('Error al exportar ventas:', err);
        alert('Ocurrió un error al exportar las ventas.');
      }
    });
  }
}
