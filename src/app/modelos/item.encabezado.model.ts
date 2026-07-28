import { SafeHtml } from '@angular/platform-browser';

export class ItemEncabezadoModel{
    idMenu?: string;
    ruta?: string;
    texto?: string;
    accion?: string;
    icono?: string;
    safeIcono?: SafeHtml;
}