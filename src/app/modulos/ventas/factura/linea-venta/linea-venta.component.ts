import { Component, Input, Output, EventEmitter } from '@angular/core';
import { VentaModel } from '../../../../modelos/venta.model';

@Component({
  selector: 'app-linea-venta',
  templateUrl: './linea-venta.component.html',
  styleUrl: './linea-venta.component.css'
})
export class LineaVentaComponent {
  @Input() lineasVenta: VentaModel[] = [];
  @Output() lineasVentaChange = new EventEmitter<VentaModel[]>();
  @Output() totalChange = new EventEmitter<number>();
  @Output() finalizarVentaEvent = new EventEmitter<void>();

  agregarLinea(producto: any): void {
    if (!producto.zapatoId || !producto.CantidadVenta || !producto.PrecioVenta) {
      alert('Por favor complete todos los campos del producto');
      return;
    }

    const nuevaLinea: VentaModel = {
      zapatoId: producto.zapatoId,
      Cantidad: parseInt(producto.CantidadVenta),
      Precio: parseFloat(producto.PrecioVenta),
      Almacen: ''
    };

    this.lineasVenta.push(nuevaLinea);
    this.lineasVentaChange.emit(this.lineasVenta);
    this.actualizarTotal();
  }

  eliminarLinea(index: number): void {
    this.lineasVenta.splice(index, 1);
    this.lineasVentaChange.emit(this.lineasVenta);
    this.actualizarTotal();
  }

  actualizarCantidad(index: number, cantidad: number): void {
    if (cantidad > 0) {
      this.lineasVenta[index].Cantidad = cantidad;
      this.actualizarTotal();
    }
  }

  actualizarPrecio(index: number, precio: number): void {
    if (precio > 0) {
      this.lineasVenta[index].Precio = precio;
      this.actualizarTotal();
    }
  }

  calcularSubtotal(index: number): number {
    const linea = this.lineasVenta[index];
    return (linea.Cantidad || 0) * (linea.Precio || 0);
  }

  obtenerTotal(): number {
    return this.lineasVenta.reduce((total, linea) => {
      return total + ((linea.Cantidad || 0) * (linea.Precio || 0));
    }, 0);
  }

  actualizarTotal(): void {
    this.totalChange.emit(this.obtenerTotal());
  }

  limpiarLineas(): void {
    this.lineasVenta = [];
    this.lineasVentaChange.emit(this.lineasVenta);
    this.actualizarTotal();
  }

  finalizarVenta(): void {
    this.finalizarVentaEvent.emit();
  }
}