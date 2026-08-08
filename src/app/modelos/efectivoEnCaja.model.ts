export class EfectivoEnCajaModel {
    fecha?: string;
    ventasEfectivo?: number;
    base?: number;
    gastos?: number;
    entrega?: number;
    efectivoEnCaja?: number;
    quedaEnCaja?: number;
    resumenVentas?: any[];
    totalVentas?: number;
    totalZapatosVendidos?: number;
    resumenMetodoPago?: any[];
    totalMetodoPago?: number;
    entregaCierre?: number;
    detalleGastos?: any[];
    detalleEntregas?: any[];
    TotalReembolsos?: number;
    devoluciones?: number;
    credito?: number;
    abonos?: number;
    vendedoresVentas?: Array<{vendedor: string; zapatosVendidos: number}>;
}