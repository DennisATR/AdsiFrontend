// ─── Respuesta de /dashboard/kpis ───────────────────────────────────────────
export interface DashboardKpiModel {
  totalVentas: number;
  totalFacturas: number;
  ticketPromedio: number;
  totalPares: number;
  gananciaBruta: number;
  totalGastos: number;
  totalEntregas: number;
  totalEgresos: number;
  gananciaNeta: number;
  margenPorcentaje: number;
}

// ─── Respuesta de /dashboard/ultimos-30-dias y /dashboard/analisis-mensual ──
export interface DashboardSerieTemporalModel {
  etiqueta: string;        // YYYY-MM-DD (30 días) | Enero … Diciembre (mensual)
  mes?: number;            // solo en análisis mensual
  ventas: number;
  gananciaBruta: number;
  egresos: number;
  gananciaNeta?: number;   // solo en análisis mensual
}

// ─── Respuesta de /dashboard/top-productos ───────────────────────────────────
export interface DashboardTopProductoModel {
  zapatoId: string;
  descripcion: string;
  categoria: string;
  unidades: number;
  ingresos: number;
  ganancia: number;
}

export interface DashboardTopProductosResponseModel {
  productos: DashboardTopProductoModel[];
  categorias: string[];
}

// ─── Respuesta de /dashboard/metodos-pago ────────────────────────────────────
export interface DashboardMetodoPagoModel {
  nombre: string;
  total: number;
  cantidad: number;
  porcentaje: number;
}

// ─── Respuesta de /dashboard/egresos-desglose ────────────────────────────────
export interface DashboardEgresosDesglose {
  totalGastos: number;
  totalEntregas: number;
  totalEgresos: number;
  gastos: {
    id: number;
    fecha: string;
    concepto: string;
    descripcion: string;
    valor: number;
  }[];
  entregas: {
    id: number;
    fecha: string;
    empresa: string;
    numCajas: number;
    cobro: number;
  }[];
}

// ─── Respuesta de /dashboard/gastos-analisis ────────────────────────────────
export interface DashboardGastoConceptoModel {
  concepto: string;
  total: number;
  cantidad: number;
  porcentaje: number;
}

export interface DashboardGastosAnalisisModel {
  totalGastos: number;
  totalEntregas: number;
  totalEgresos: number;
  numDias: number;
  promedioDiarioGastos: number;
  promedioDiarioEgresos: number;
  conceptoMayorGasto: string;
  porConceptos: DashboardGastoConceptoModel[];
}

// ─── Filtro de fecha para el componente ─────────────────────────────────────
export interface FiltroDashboardModel {
  inicio: string;   // YYYY-MM-DD
  fin: string;      // YYYY-MM-DD
  etiqueta: string; // texto legible: "Últimos 30 días", etc.
}

// ─── Respuesta de /dashboard/creditos-analisis ──────────────────────────────
export interface DashboardCreditosAnalisisModel {
  totalCreditos: number;
  totalAbonado: number;
  saldoPendiente: number;
  porcentajeRecaudo: number;
  creditosTotalCount: number;
  creditosPendientesCount: number;
  creditosPagadosCount: number;
}
