export class CreditoDetalleModel {
    creditoId?: number;
    facturaId?: number;
    clienteNombre?: string;
    clienteApellido?: string;
    zapatoDescripcion?: string;
    zapatoTalla?: number;
    zapatoColor?: string;
    valorTotal?: number;
    valorAbonado?: number;
    saldo?: number;
    estado?: string;
    fechaFactura?: Date;
}
