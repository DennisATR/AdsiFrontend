import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { forkJoin } from 'rxjs';
import {
  DashboardCreditosAnalisisModel,
  DashboardEgresosDesglose,
  DashboardGastosAnalisisModel,
  DashboardKpiModel,
  DashboardMetodoPagoModel,
  DashboardSerieTemporalModel,
  DashboardTopProductoModel,
  FiltroDashboardModel,
} from '../../../modelos/dashboard.model';
import { DashboardService } from '../../../servicios/ventas/dashboard.service';
import { ConfiguracionListas } from '../../../config/configuracion.listas';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  // ──── Referencias a canvas ────────────────────────────────────────────────
  @ViewChild('chartLineas') chartLineasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartBarras') chartBarrasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartTop') chartTopRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartDona') chartDonaRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartEgresos') chartEgresosRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartCreditos') chartCreditosRef!: ElementRef<HTMLCanvasElement>;

  // ──── Instancias de gráficos ──────────────────────────────────────────────
  private chartLineas?: Chart;
  private chartBarras?: Chart;
  private chartTop?: Chart;
  private chartDona?: Chart;
  private chartEgresos?: Chart;
  private chartCreditos?: Chart;

  // ──── Estado ──────────────────────────────────────────────────────────────
  cargando = false;
  error = '';

  kpis: DashboardKpiModel | null = null;
  serieLineas: DashboardSerieTemporalModel[] = [];
  serieBarras: DashboardSerieTemporalModel[] = [];
  topProductos: DashboardTopProductoModel[] = [];
  categoriasTop: string[] = ConfiguracionListas.categoriasZapatos;
  categoriaSeleccionada = 'Todas';

  metodosPago: DashboardMetodoPagoModel[] = [];
  desglose: DashboardEgresosDesglose | null = null;
  entregasPorEmpresa: { empresa: string; total: number; numCajas: number; porcentaje: number }[] = [];
  gastosAnalisis: DashboardGastosAnalisisModel | null = null;
  creditosAnalisis: DashboardCreditosAnalisisModel | null = null;

  coloresMetodos: string[] = [
    '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'
  ];

  anioSeleccionado = new Date().getFullYear();
  aniosDisponibles: number[] = [];

  // ──── Filtros de período ──────────────────────────────────────────────────
  filtros: FiltroDashboardModel[] = this.construirFiltros();
  filtroActivo: FiltroDashboardModel;

  fechaInicio: string;
  fechaFin: string;

  constructor(private dashboardService: DashboardService) {
    this.filtroActivo = this.filtros[2]; // Últimos 30 días por defecto
    this.fechaInicio = this.filtroActivo.inicio;
    this.fechaFin = this.filtroActivo.fin;

    const anioActual = new Date().getFullYear();
    for (let y = anioActual; y >= anioActual - 4; y--) {
      this.aniosDisponibles.push(y);
    }
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngAfterViewInit(): void {
    // Los gráficos se inicializan después de recibir los datos
  }

  ngOnDestroy(): void {
    this.chartLineas?.destroy();
    this.chartBarras?.destroy();
    this.chartTop?.destroy();
    this.chartDona?.destroy();
    this.chartEgresos?.destroy();
    this.chartCreditos?.destroy();
  }

  // ──── Helpers de formato y color ──────────────────────────────────────────
  formatCurrency(val: number): string {
    return '$' + (val || 0).toLocaleString('es-CO');
  }

  formatPct(val: number): string {
    return val + '%';
  }

  calcularPorcentaje(parte: number, total: number): number {
    if (!total || total <= 0) return 0;
    return Math.round((parte / total) * 100);
  }

  getColorMetodo(index: number): string {
    return this.coloresMetodos[index % this.coloresMetodos.length];
  }

  // ──── Filtros ─────────────────────────────────────────────────────────────
  private construirFiltros(): FiltroDashboardModel[] {
    const hoy = new Date();
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const hace = (dias: number) =>
      new Date(hoy.getTime() - dias * 24 * 60 * 60 * 1000);

    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const primerDiaAnio = new Date(hoy.getFullYear(), 0, 1);

    return [
      {inicio: fmt(hoy), fin: fmt(hoy), etiqueta: 'Hoy'},
      {inicio: fmt(hace(6)), fin: fmt(hoy), etiqueta: 'Últimos 7 días'},
      {inicio: fmt(hace(29)), fin: fmt(hoy), etiqueta: 'Últimos 30 días'},
      {inicio: fmt(primerDiaMes), fin: fmt(hoy), etiqueta: 'Este mes'},
      {inicio: fmt(primerDiaAnio), fin: fmt(hoy), etiqueta: 'Este año'},
    ];
  }

  seleccionarFiltro(filtro: FiltroDashboardModel): void {
    this.filtroActivo = filtro;
    this.fechaInicio = filtro.inicio;
    this.fechaFin = filtro.fin;
    this.cargarDatos();
  }

  aplicarFiltroPersonalizado(): void {
    if (!this.fechaInicio || !this.fechaFin) return;
    if (this.fechaInicio > this.fechaFin) {
      const temp = this.fechaInicio;
      this.fechaInicio = this.fechaFin;
      this.fechaFin = temp;
    }

    const filtroPersonalizado: FiltroDashboardModel = {
      inicio: this.fechaInicio,
      fin: this.fechaFin,
      etiqueta: `${this.fechaInicio} al ${this.fechaFin}`,
    };

    this.filtroActivo = filtroPersonalizado;
    this.cargarDatos();
  }

  cambiarAnio(anio: number): void {
    this.anioSeleccionado = anio;
    this.cargarAnalisisMensual();
  }

  cambiarCategoriaTop(cat: string): void {
    this.categoriaSeleccionada = cat;
    this.dashboardService
      .obtenerTopProductos(20, cat, this.fechaInicio, this.fechaFin)
      .subscribe(res => {
        this.topProductos = res.productos;
        setTimeout(() => this.renderizarGraficoTop(), 0);
      });
  }

  // ──── Carga de datos ──────────────────────────────────────────────────────
  cargarDatos(): void {
    this.cargando = true;
    this.error = '';
    const inicio = this.fechaInicio;
    const fin = this.fechaFin;

    forkJoin({
      kpis: this.dashboardService.obtenerKpis(inicio, fin),
      lineas: this.dashboardService.obtenerUltimos30Dias(inicio, fin),
      topRes: this.dashboardService.obtenerTopProductos(20, this.categoriaSeleccionada, inicio, fin),
      metodos: this.dashboardService.obtenerMetodosPago(inicio, fin),
      desglose: this.dashboardService.obtenerEgresosDesglose(inicio, fin),
      gastosAnalisis: this.dashboardService.obtenerGastosAnalisis(inicio, fin),
      creditosAnalisis: this.dashboardService.obtenerCreditosAnalisis(inicio, fin),
      barras: this.dashboardService.obtenerAnalisisMensual(
        this.anioSeleccionado,
      ),
    }).subscribe({
      next: data => {
        this.kpis = data.kpis;
        this.serieLineas = data.lineas;
        this.serieBarras = data.barras;
        this.topProductos = data.topRes.productos;
        const catSet = new Set([...ConfiguracionListas.categoriasZapatos, ...(data.topRes.categorias || [])]);
        this.categoriasTop = Array.from(catSet);
        this.metodosPago = data.metodos;
        this.desglose = data.desglose;
        if (this.desglose) {
          this.calcularEntregasPorEmpresa();
        }
        this.gastosAnalisis = data.gastosAnalisis;
        this.creditosAnalisis = data.creditosAnalisis;
        this.cargando = false;
        setTimeout(() => this.renderizarGraficos(), 0);
      },
      error: err => {
        console.error(err);
        this.error =
          'Error al cargar los datos del dashboard. Verifica que el servidor esté activo.';
        this.cargando = false;
      },
    });
  }

  private calcularEntregasPorEmpresa(): void {
    if (!this.desglose?.entregas) return;
    const mapa = new Map<string, { total: number; numCajas: number }>();
    let totalCobros = 0;

    for (const e of this.desglose.entregas) {
      const emp = e.empresa || 'Sin Especificar';
      const actual = mapa.get(emp) || { total: 0, numCajas: 0 };
      mapa.set(emp, {
        total: actual.total + (e.cobro || 0),
        numCajas: actual.numCajas + (e.numCajas || 0),
      });
      totalCobros += (e.cobro || 0);
    }

    this.entregasPorEmpresa = Array.from(mapa.entries()).map(([empresa, d]) => ({
      empresa,
      total: d.total,
      numCajas: d.numCajas,
      porcentaje: totalCobros > 0 ? Math.round((d.total / totalCobros) * 100) : 0,
    })).sort((a, b) => b.total - a.total);
  }

  private cargarAnalisisMensual(): void {
    this.dashboardService
      .obtenerAnalisisMensual(this.anioSeleccionado)
      .subscribe(data => {
        this.serieBarras = data;
        setTimeout(() => this.renderizarGraficoBarras(), 0);
      });
  }

  // ──── Renderizado de gráficos (Modo Claro) ─────────────────────────────────
  private renderizarGraficos(): void {
    this.renderizarGraficoLineas();
    this.renderizarGraficoBarras();
    this.renderizarGraficoTop();
    this.renderizarGraficoDona();
    this.renderizarGraficoEgresos();
    this.renderizarGraficoCreditos();
  }

  private renderizarGraficoLineas(): void {
    const ctx = this.chartLineasRef?.nativeElement?.getContext('2d');
    if (!ctx) return;
    this.chartLineas?.destroy();

    const gradGanancia = ctx.createLinearGradient(0, 0, 0, 350);
    gradGanancia.addColorStop(0, 'rgba(16,185,129,0.25)');
    gradGanancia.addColorStop(1, 'rgba(16,185,129,0)');

    const gradVentas = ctx.createLinearGradient(0, 0, 0, 350);
    gradVentas.addColorStop(0, 'rgba(37,99,235,0.25)');
    gradVentas.addColorStop(1, 'rgba(37,99,235,0)');

    const labels = this.serieLineas.map(d =>
      d.etiqueta.slice(5).replace('-', '/'),
    );

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Ventas',
            data: this.serieLineas.map(d => d.ventas),
            borderColor: '#2563eb',
            backgroundColor: gradVentas as any,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#2563eb',
            pointRadius: 3,
            pointHoverRadius: 6,
            borderWidth: 2,
          },
          {
            label: 'Ganancia Bruta',
            data: this.serieLineas.map(d => d.gananciaBruta),
            borderColor: '#10b981',
            backgroundColor: gradGanancia as any,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#10b981',
            pointRadius: 3,
            pointHoverRadius: 6,
            borderWidth: 2,
          },
          {
            label: 'Egresos',
            data: this.serieLineas.map(d => d.egresos),
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239,68,68,0.06)',
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#ef4444',
            pointRadius: 3,
            pointHoverRadius: 6,
            borderWidth: 2,
            borderDash: [5, 3],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {mode: 'index', intersect: false},
        plugins: {
          legend: {
            labels: {color: '#334155', font: {size: 12, weight: 'bold'}},
          },
          tooltip: {
            callbacks: {
              label: ctx =>
                ` ${ctx.dataset.label}: $${(ctx.parsed.y ?? 0).toLocaleString('es-CO')}`,
            },
          },
        },
        scales: {
          x: {
            ticks: {color: '#475569', maxTicksLimit: 12, maxRotation: 0},
            grid: {color: 'rgba(0,0,0,0.05)'},
          },
          y: {
            ticks: {
              color: '#475569',
              callback: v => '$' + Number(v).toLocaleString('es-CO'),
            },
            grid: {color: 'rgba(0,0,0,0.05)'},
          },
        },
      },
    };
    this.chartLineas = new Chart(ctx, config);
  }

  private renderizarGraficoBarras(): void {
    const ctx = this.chartBarrasRef?.nativeElement?.getContext('2d');
    if (!ctx) return;
    this.chartBarras?.destroy();

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: this.serieBarras.map(d => d.etiqueta),
        datasets: [
          {
            label: 'Ventas',
            data: this.serieBarras.map(d => d.ventas),
            backgroundColor: 'rgba(37,99,235,0.85)',
            borderRadius: 6,
          },
          {
            label: 'Ganancia Bruta',
            data: this.serieBarras.map(d => d.gananciaBruta),
            backgroundColor: 'rgba(16,185,129,0.85)',
            borderRadius: 6,
          },
          {
            label: 'Egresos',
            data: this.serieBarras.map(d => d.egresos),
            backgroundColor: 'rgba(239,68,68,0.85)',
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {mode: 'index'},
        plugins: {
          legend: {
            labels: {color: '#334155', font: {size: 12, weight: 'bold'}},
          },
          tooltip: {
            callbacks: {
              label: ctx =>
                ` ${ctx.dataset.label}: $${(ctx.parsed.y ?? 0).toLocaleString('es-CO')}`,
            },
          },
        },
        scales: {
          x: {
            ticks: {color: '#475569'},
            grid: {color: 'rgba(0,0,0,0.04)'},
          },
          y: {
            ticks: {
              color: '#475569',
              callback: v => '$' + Number(v).toLocaleString('es-CO'),
            },
            grid: {color: 'rgba(0,0,0,0.04)'},
          },
        },
      },
    };
    this.chartBarras = new Chart(ctx, config);
  }

  private renderizarGraficoTop(): void {
    const ctx = this.chartTopRef?.nativeElement?.getContext('2d');
    if (!ctx) return;
    this.chartTop?.destroy();

    const colores = this.topProductos.map((_, i) =>
      this.coloresMetodos[i % this.coloresMetodos.length],
    );

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: this.topProductos.map(p =>
          p.descripcion.length > 18
            ? p.descripcion.slice(0, 18) + '…'
            : p.descripcion,
        ),
        datasets: [
          {
            label: 'Unidades vendidas',
            data: this.topProductos.map(p => p.unidades),
            backgroundColor: colores,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {display: false},
          tooltip: {
            callbacks: {
              label: ctx => {
                const prod = this.topProductos[ctx.dataIndex];
                return ` Unidades: ${ctx.parsed.y} | Total: $${(prod?.ingresos ?? 0).toLocaleString('es-CO')}`;
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: '#334155',
              font: {weight: 'bold', size: 10},
              maxRotation: 45,
              minRotation: 0,
            },
            grid: {display: false},
          },
          y: {
            ticks: {color: '#475569', stepSize: 1},
            grid: {color: 'rgba(0,0,0,0.04)'},
          },
        },
      },
    };
    this.chartTop = new Chart(ctx, config);
  }

  private renderizarGraficoDona(): void {
    const ctx = this.chartDonaRef?.nativeElement?.getContext('2d');
    if (!ctx) return;
    this.chartDona?.destroy();

    const donaOpts: Record<string, any> = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: {
          display: false, // La leyenda detallada con montos y porcentajes se muestra debajo en HTML
        },
        tooltip: {
          callbacks: {
            label: (ctx: any) =>
              ` ${ctx.label}: $${ctx.parsed.toLocaleString('es-CO')} (${
                (this.metodosPago[ctx.dataIndex]?.porcentaje ?? 0)
              }%)`,
          },
        },
      },
    };

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: this.metodosPago.map(m => m.nombre),
        datasets: [
          {
            data: this.metodosPago.map(m => m.total),
            backgroundColor: this.coloresMetodos.slice(0, this.metodosPago.length),
            hoverOffset: 6,
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: donaOpts,
    };
    this.chartDona = new Chart(ctx, config);
  }

  private renderizarGraficoEgresos(): void {
    const ctx = this.chartEgresosRef?.nativeElement?.getContext('2d');
    if (!ctx || !this.desglose) return;
    this.chartEgresos?.destroy();

    const totalEgresos = this.desglose.totalEgresos || 1;
    const pctGastos = this.calcularPorcentaje(this.desglose.totalGastos, totalEgresos);
    const pctEntregas = this.calcularPorcentaje(this.desglose.totalEntregas, totalEgresos);

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: ['Gastos Operativos', 'Envíos / Entregas'],
        datasets: [
          {
            data: [this.desglose.totalGastos, this.desglose.totalEntregas],
            backgroundColor: ['#ef4444', '#f59e0b'],
            hoverOffset: 6,
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (ctx: any) => {
                const val = ctx.parsed ?? 0;
                const pct = ctx.dataIndex === 0 ? pctGastos : pctEntregas;
                return ` ${ctx.label}: $${val.toLocaleString('es-CO')} (${pct}%)`;
              },
            },
          },
        },
      } as any,
    };
    this.chartEgresos = new Chart(ctx, config);
  }

  private renderizarGraficoCreditos(): void {
    const ctx = this.chartCreditosRef?.nativeElement?.getContext('2d');
    if (!ctx || !this.creditosAnalisis) return;
    this.chartCreditos?.destroy();

    const total = this.creditosAnalisis.totalCreditos || 1;
    const abonado = this.creditosAnalisis.totalAbonado;
    const saldo = this.creditosAnalisis.saldoPendiente;
    const pctAbono = this.calcularPorcentaje(abonado, total);
    const pctSaldo = this.calcularPorcentaje(saldo, total);

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: ['Monto Recaudado', 'Saldo Pendiente por Cobrar'],
        datasets: [
          {
            data: [abonado, saldo],
            backgroundColor: ['#10b981', '#ef4444'],
            hoverOffset: 6,
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: any) => {
                const val = ctx.parsed ?? 0;
                const pct = ctx.dataIndex === 0 ? pctAbono : pctSaldo;
                return ` ${ctx.label}: $${val.toLocaleString('es-CO')} (${pct}%)`;
              },
            },
          },
        },
      } as any,
    };
    this.chartCreditos = new Chart(ctx, config);
  }
}


