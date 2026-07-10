import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreditoDetalleModel } from '../../../../modelos/creditoDetalle.model';
import { PagoFacturaService } from '../../../../servicios/ventas/pago-factura.service';
import { MetodoPagoModel } from '../../../../modelos/metodoPago.model';
import { MetodoPagoService } from '../../../../servicios/ventas/metodo-pago.service';

@Component({
  selector: 'app-editar-credito',
  templateUrl: './editar-credito.component.html',
  styleUrl: './editar-credito.component.css'
})
export class EditarCreditoComponent implements OnInit {
  @Input() mostrarModal: boolean = false;
  @Input() creditoSeleccionado: CreditoDetalleModel | null = null;
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() pagoRegistrado = new EventEmitter<void>();

  fgPago!: FormGroup;
  metodosPago: MetodoPagoModel[] = [];
  metodosPagoNombres: string[] = [];

  constructor(
    private fb: FormBuilder,
    private servicioPago: PagoFacturaService,
    private servicioMetodoPago: MetodoPagoService
  ) {
    this.ConstruirFormulario();
  }

  ngOnInit(): void {
    this.obtenerMetodosPago();
  }

  ConstruirFormulario() {
    this.fgPago = this.fb.group({
      montoPago: ['', [Validators.required, Validators.min(0)]],
      montoRecibido: ['', [Validators.min(0)]],
      metodoPagoId: ['', [Validators.required]],
      MetodoPagoNombre: ['', [Validators.required]]
    });
  }

  CerrarModal() {
    this.cerrarModal.emit();
    this.fgPago.reset();
  }

  RegistrarPago() {
    if (this.fgPago.invalid || !this.creditoSeleccionado) {
      alert("Por favor complete todos los campos del pago");
      return;
    }

    const montoPago = this.fgPago.get('montoPago')?.value;
    const metodoPagoId = this.fgPago.get('metodoPagoId')?.value;
    let montoRecibido = this.fgPago.get('montoRecibido')?.value;

    if (montoPago > (this.creditoSeleccionado.saldo || 0)) {
      alert("El monto del pago no puede ser mayor al saldo pendiente");
      return;
    }

    if (montoRecibido === null || montoRecibido === undefined || montoRecibido === '' || montoRecibido === 0) {
      montoRecibido = montoPago;
    }

    if (montoRecibido < montoPago) {
      alert("El monto recibido no puede ser menor al monto a pagar");
      return;
    }

    const datoPago = {
      facturaId: this.creditoSeleccionado.facturaId,
      metodoPagoId: parseInt(metodoPagoId, 10),
      Monto: parseFloat(montoPago),
      MontoRecibido: parseFloat(montoRecibido)
    };

    this.servicioPago.RegistrarPagoFactura(datoPago).subscribe({
      next: (response: any) => {
        alert("Pago registrado exitosamente");
        this.fgPago.reset();
        this.pagoRegistrado.emit();
        this.CerrarModal();
      },
      error: (err: any) => {
        console.error('Error al registrar pago:', err);
        alert('Error al registrar el pago: ' + (err.error?.error?.message || 'Error desconocido'));
      }
    });
  }

  obtenerMetodosPago() {
    this.servicioMetodoPago.ObtenerMetodosPago().subscribe({
      next: (respuesta: MetodoPagoModel[]) => {
        this.metodosPago = respuesta;
        this.metodosPagoNombres = this.metodosPago.map(
          m => `${m.Nombre} (ID: ${m.id})`
        );
      },
      error: (err) => {
        alert('Error al obtener los métodos de pago');
        console.error('Error:', err);
      }
    });
  }

  onMetodoPagoSeleccionado(nombreCompleto: string): void {
    const match = nombreCompleto.match(/\(ID:\s*(\d+)\)/);
    if (match) {
      const metodoPagoId = match[1];
      this.fgPago.get('metodoPagoId')?.setValue(metodoPagoId);
    }
  }

  onMontoPagoClick() {
    if (this.creditoSeleccionado && this.creditoSeleccionado.saldo) {
      const currentVal = this.fgPago.get('montoPago')?.value;
      if (!currentVal || currentVal === 0) {
        this.fgPago.get('montoPago')?.setValue(this.creditoSeleccionado.saldo);
        
        const currentRecibido = this.fgPago.get('montoRecibido')?.value;
        if (!currentRecibido || currentRecibido === 0) {
          this.fgPago.get('montoRecibido')?.setValue(this.creditoSeleccionado.saldo);
        }
      }
    }
  }

  calcularCambio(): number {
    const montoPago = this.fgPago.get('montoPago')?.value || 0;
    const montoRecibido = this.fgPago.get('montoRecibido')?.value || 0;
    if (montoRecibido > 0 && montoRecibido >= montoPago) {
      return montoRecibido - montoPago;
    }
    return 0;
  }

  // Métodos para validaciones
  get montoPago() { return this.fgPago.get('montoPago'); }
  get montoRecibido() { return this.fgPago.get('montoRecibido'); }
  get metodoPago() { return this.fgPago.get('metodoPagoId'); }
}
