import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfiguracionListas } from '../../../../config/configuracion.listas';
import { FacturaService } from '../../../../servicios/ventas/factura.service';
import { VentaService } from '../../../../servicios/ventas/venta.service';
import { DevolucionService } from '../../../../servicios/ventas/devolucion.service';
import { FacturaModel } from '../../../../modelos/factura.model';
import { VentaModel } from '../../../../modelos/venta.model';

@Component({
  selector: 'app-crear-devolucion',
  templateUrl: './crear-devolucion.component.html',
  styleUrl: './crear-devolucion.component.css'
})
export class CrearDevolucionComponent implements OnInit {
  fGroup: FormGroup = new FormGroup({});

  facturas: FacturaModel[] = [];
  facturasNombres: string[] = [];
  ventasFactura: VentaModel[] = [];
  ventaSeleccionada: VentaModel | null = null;

  cargandoFacturas = false;
  cargandoVentas = false;
  registrandoDevolucion = false;
  mensajeEstado = '';
  errorEstado = '';
  razonesDevolucion: string[] = ConfiguracionListas.razonesDevolucion;

  constructor(
    private fb: FormBuilder,
    private servicioFactura: FacturaService,
    private servicioVenta: VentaService,
    private servicioDevolucion: DevolucionService
  ) { }

  ngOnInit(): void {
    this.ConstruirFormulario();
    this.ObtenerFacturas();
  }

  get ObtenerFormGroup() {
    return this.fGroup.controls;
  }

  ConstruirFormulario(): void {
    this.fGroup = this.fb.group({
      facturaBusqueda: ['', [Validators.required]],
      facturaId: ['', [Validators.required]],
      ventaId: ['', [Validators.required]],
      Cantidad: ['', [Validators.required, Validators.min(1)]],
      Observacion: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ObtenerFacturas(): void {
    this.cargandoFacturas = true;
    this.errorEstado = '';

    this.servicioFactura.ObtenerFacturas().subscribe({
      next: (respuesta: FacturaModel[]) => {
        this.facturas = respuesta ?? [];
        this.facturasNombres = this.facturas.map((factura) => {
          const total = this.formatearMoneda(factura.Total ?? 0);
          return `Factura #${factura.id} - Total ${total}`;
        });
        this.cargandoFacturas = false;
      },
      error: (error) => {
        console.error('Error al obtener facturas:', error);
        this.errorEstado = 'No fue posible cargar las facturas para buscar devoluciones.';
        this.cargandoFacturas = false;
      }
    });
  }

  onFacturaSeleccionada(facturaCompleta: string): void {
    const facturaId = this.extraerIdDeTexto(facturaCompleta);

    if (!facturaId) {
      this.LimpiarVentas();
      return;
    }

    this.fGroup.patchValue({
      facturaId,
      ventaId: ''
    });

    this.ventaSeleccionada = null;
    this.ObtenerVentasPorFactura(facturaId);
  }

  ObtenerVentasPorFactura(facturaId: number): void {
    this.cargandoVentas = true;
    this.errorEstado = '';
    this.ventasFactura = [];

    this.servicioVenta.ObtenerVentasPorFactura(String(facturaId)).subscribe({
      next: (respuesta: VentaModel[]) => {
        this.ventasFactura = (respuesta ?? []).map((venta) => this.normalizarVenta(venta));
        this.cargandoVentas = false;

        if (this.ventasFactura.length === 0) {
          this.mensajeEstado = 'La factura seleccionada no tiene ventas asociadas.';
        } else {
          this.mensajeEstado = 'Seleccione una venta para registrar la devolución.';
        }
      },
      error: (error) => {
        console.error('Error al obtener ventas de la factura:', error);
        this.cargandoVentas = false;
        this.errorEstado = 'No fue posible cargar las ventas de esa factura.';
      }
    });
  }

  SeleccionarVenta(venta: VentaModel): void {
    this.ventaSeleccionada = venta;
    this.fGroup.patchValue({
      ventaId: venta.id ?? '',
      Cantidad: venta.Cantidad ?? ''
    });

    this.fGroup.get('Cantidad')?.setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(Number(venta.Cantidad ?? 0))
    ]);
    this.fGroup.get('Cantidad')?.updateValueAndValidity();
  }

  RegistrarDevolucion(): void {
    if (this.fGroup.invalid || !this.ventaSeleccionada) {
      this.fGroup.markAllAsTouched();
      this.errorEstado = 'Seleccione la factura, una venta y escriba una observación para continuar.';
      return;
    }

    const facturaId = Number(this.fGroup.get('facturaId')?.value);
    const ventaId = Number(this.fGroup.get('ventaId')?.value);
    const cantidad = Number(this.fGroup.get('Cantidad')?.value);
    const observacion = String(this.fGroup.get('Observacion')?.value ?? '').trim();

    if (!facturaId || !ventaId || !cantidad) {
      this.errorEstado = 'No fue posible identificar la factura o la venta seleccionada.';
      return;
    }

    if (this.ventaSeleccionada && cantidad > Number(this.ventaSeleccionada.Cantidad ?? 0)) {
      this.errorEstado = 'La cantidad no puede ser mayor a la cantidad disponible en la venta.';
      return;
    }

    this.registrandoDevolucion = true;
    this.errorEstado = '';
    this.mensajeEstado = '';

    const datosDevolucion = {
      ventaId,
      Cantidad: cantidad,
      Observacion: observacion
    };

    this.servicioDevolucion.RegistrarDevolucion(datosDevolucion).subscribe({
      next: () => {
        this.registrandoDevolucion = false;
        alert('Devolución registrada exitosamente. Dinero a devolver: ' + this.formatearMoneda((this.ventaSeleccionada?.Precio ?? 0) * cantidad));
        this.fGroup.patchValue({
          ventaId: '',
          Cantidad: '',
          Observacion: ''
        });
        this.fGroup.get('Observacion')?.markAsUntouched();
        this.ventaSeleccionada = null;
        this.ObtenerVentasPorFactura(facturaId);
      },
      error: (error) => {
        alert(`Error al registrar la devolución: ${error}`);
        this.registrandoDevolucion = false;
      }
    });
  }

  obtenerFactura(): void {
    const numeroBuscado = String(this.fGroup.get('facturaBusqueda')?.value ?? '').trim();

    if (!numeroBuscado) {
      this.errorEstado = 'Por favor, ingrese un número de factura.';
      this.LimpiarVentas();
      return;
    }

    const factura = this.facturas.find(f => String(f.id) === numeroBuscado);

    if (!factura) {
      this.errorEstado = `No se encontró una factura con el número ${numeroBuscado}.`;
      this.LimpiarVentas();
      return;
    }

    this.errorEstado = '';
    this.fGroup.patchValue({
      facturaId: factura.id,
      ventaId: '',
      Cantidad: ''
    });

    this.ventaSeleccionada = null;
    this.ObtenerVentasPorFactura(factura.id ?? 0);
  }

  LimpiarConsulta(): void {
    this.fGroup.reset();
    this.ventasFactura = [];
    this.ventaSeleccionada = null;
    this.mensajeEstado = '';
    this.errorEstado = '';
  }

  private LimpiarVentas(): void {
    this.fGroup.patchValue({
      facturaId: '',
      ventaId: '',
      Cantidad: ''
    });
    this.ventasFactura = [];
    this.ventaSeleccionada = null;
    this.mensajeEstado = '';
  }

  private extraerIdDeTexto(texto: string): number | null {
    const coincidencia = texto.match(/#\s*(\d+)/);
    return coincidencia ? Number(coincidencia[1]) : null;
  }

  private normalizarVenta(venta: any): VentaModel {
    return {
      id: venta?.id ?? venta?.Id,
      Cantidad: Number(venta?.Cantidad ?? venta?.cantidad ?? 0),
      Precio: Number(venta?.Precio ?? venta?.precio ?? 0),
      almacenId: Number(venta?.almacenId ?? venta?.AlmacenId ?? 0),
      zapatoId: String(venta?.zapatoId ?? venta?.ZapatoId ?? ''),
      facturaId: Number(venta?.facturaId ?? venta?.FacturaId ?? 0),
      tipoVenta: String(venta?.tipoVenta ?? venta?.TipoVenta ?? '')
    };
  }

  private formatearMoneda(valor: number): string {
    return valor.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    });
  }

  calcularSubtotal(venta: VentaModel): number {
    return (venta.Cantidad ?? 0) * (venta.Precio ?? 0);
  }

}
