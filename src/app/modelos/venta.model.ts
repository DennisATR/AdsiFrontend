export class VentaModel{
    id?: number;
    Cantidad?: number;
    Precio?: number;
    almacenId?: number;
    zapatoId?: string;
    facturaId?: number;
    tipoVenta?: string; // 'contado' o 'credito'
}