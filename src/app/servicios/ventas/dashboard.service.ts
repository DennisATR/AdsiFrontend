import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfiguracionRutasBackend } from '../../config/configuracion.rutas.backend';
import {
  DashboardCreditosAnalisisModel,
  DashboardEgresosDesglose,
  DashboardGastosAnalisisModel,
  DashboardKpiModel,
  DashboardMetodoPagoModel,
  DashboardSerieTemporalModel,
  DashboardTopProductosResponseModel,
} from '../../modelos/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private url = ConfiguracionRutasBackend.urlBackend;

  constructor(private http: HttpClient) {}

  /** KPIs financieros del período */
  obtenerKpis(inicio?: string, fin?: string): Observable<DashboardKpiModel> {
    let params = new HttpParams();
    if (inicio) params = params.set('inicio', inicio);
    if (fin) params = params.set('fin', fin);
    return this.http.get<DashboardKpiModel>(`${this.url}dashboard/kpis`, {
      params,
    });
  }

  /** Ventas, ganancias y egresos día a día — en el rango de fechas */
  obtenerUltimos30Dias(
    inicio?: string,
    fin?: string,
  ): Observable<DashboardSerieTemporalModel[]> {
    let params = new HttpParams();
    if (inicio) params = params.set('inicio', inicio);
    if (fin) params = params.set('fin', fin);
    return this.http.get<DashboardSerieTemporalModel[]>(
      `${this.url}dashboard/ultimos-30-dias`,
      {params},
    );
  }

  /** Ventas, ganancias y egresos mes a mes */
  obtenerAnalisisMensual(
    anio?: number,
  ): Observable<DashboardSerieTemporalModel[]> {
    let params = new HttpParams();
    if (anio) params = params.set('anio', anio.toString());
    return this.http.get<DashboardSerieTemporalModel[]>(
      `${this.url}dashboard/analisis-mensual`,
      {params},
    );
  }

  /** Top N referencias más vendidas por categoría */
  obtenerTopProductos(
    limite: number = 20,
    categoria?: string,
    inicio?: string,
    fin?: string,
  ): Observable<DashboardTopProductosResponseModel> {
    let params = new HttpParams().set('limite', limite.toString());
    if (categoria) params = params.set('categoria', categoria);
    if (inicio) params = params.set('inicio', inicio);
    if (fin) params = params.set('fin', fin);
    return this.http.get<DashboardTopProductosResponseModel>(
      `${this.url}dashboard/top-productos`,
      {params},
    );
  }

  /** Distribución de ingresos por método de pago */
  obtenerMetodosPago(
    inicio?: string,
    fin?: string,
  ): Observable<DashboardMetodoPagoModel[]> {
    let params = new HttpParams();
    if (inicio) params = params.set('inicio', inicio);
    if (fin) params = params.set('fin', fin);
    return this.http.get<DashboardMetodoPagoModel[]>(
      `${this.url}dashboard/metodos-pago`,
      {params},
    );
  }

  /** Desglose detallado de gastos y entregas */
  obtenerEgresosDesglose(
    inicio?: string,
    fin?: string,
  ): Observable<DashboardEgresosDesglose> {
    let params = new HttpParams();
    if (inicio) params = params.set('inicio', inicio);
    if (fin) params = params.set('fin', fin);
    return this.http.get<DashboardEgresosDesglose>(
      `${this.url}dashboard/egresos-desglose`,
      {params},
    );
  }

  /** Análisis de gastos por concepto y promedio diario */
  obtenerGastosAnalisis(
    inicio?: string,
    fin?: string,
  ): Observable<DashboardGastosAnalisisModel> {
    let params = new HttpParams();
    if (inicio) params = params.set('inicio', inicio);
    if (fin) params = params.set('fin', fin);
    return this.http.get<DashboardGastosAnalisisModel>(
      `${this.url}dashboard/gastos-analisis`,
      {params},
    );
  }

  /** Análisis de créditos, recaudo y cartera por cobrar */
  obtenerCreditosAnalisis(
    inicio?: string,
    fin?: string,
  ): Observable<DashboardCreditosAnalisisModel> {
    let params = new HttpParams();
    if (inicio) params = params.set('inicio', inicio);
    if (fin) params = params.set('fin', fin);
    return this.http.get<DashboardCreditosAnalisisModel>(
      `${this.url}dashboard/creditos-analisis`,
      {params},
    );
  }
}
