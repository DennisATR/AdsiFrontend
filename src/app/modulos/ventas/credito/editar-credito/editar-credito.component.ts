import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreditoDetalleModel } from '../../../../modelos/creditoDetalle.model';
import { PagoFacturaService } from '../../../../servicios/ventas/pago-factura.service';
import { MetodoPagoModel } from '../../../../modelos/metodoPago.model';
import { MetodoPagoService } from '../../../../servicios/ventas/metodo-pago.service';
import { DialogService } from '../../../../servicios/dialog.service';

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
  guardando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private servicioPago: PagoFacturaService,
    private servicioMetodoPago: MetodoPagoService,
    private dialogService: DialogService
  ) {
    this.ConstruirFormulario();
  }

  ngOnInit(): void {
    this.obtenerMetodosPago();
  }

  ConstruirFormulario() {
    this.fgPago = this.fb.group({
      montoPago: ['', [Validators.required]],
      montoRecibido: [''],
      metodoPagoId: ['', [Validators.required]],
      MetodoPagoNombre: ['', [Validators.required]]
    });
  }

  CerrarModal() {
    this.cerrarModal.emit();
    this.fgPago.reset();
  }

  onMetodoPagoSeleccionado(nombreSeleccionado: string) {
    const metodo = this.metodosPago.find(m => m.Nombre === nombreSeleccionado);
    if (metodo && metodo.id) {
      this.fgPago.get('metodoPagoId')?.setValue(metodo.id);
      this.fgPago.get('MetodoPagoNombre')?.setValue(metodo.Nombre);
    } else {
      this.fgPago.get('metodoPagoId')?.setValue('');
      this.fgPago.get('MetodoPagoNombre')?.setValue('');
    }
  }

  /** Rellena el campo montoPago con el saldo total al hacer clic en él si está vacío. */
  onMontoPagoClick() {
    if (this.creditoSeleccionado?.saldo) {
      const currentVal = this.fgPago.get('montoPago')?.value;
      if (!currentVal || currentVal === 0 || currentVal === '0') {
        this.fgPago.get('montoPago')?.setValue(this.creditoSeleccionado.saldo);
        const currentRecibido = this.fgPago.get('montoRecibido')?.value;
        if (!currentRecibido || currentRecibido === 0 || currentRecibido === '0') {
          this.fgPago.get('montoRecibido')?.setValue(this.creditoSeleccionado.saldo);
        }
      }
    }
  }

  async RegistrarPago() {
    if (this.fgPago.invalid || !this.creditoSeleccionado) {
      this.dialogService.mostrar('Por favor complete todos los campos del pago.', 'warning');
      return;
    }

    const montoPagoRaw = this.fgPago.get('montoPago')?.value;
    const montoPago = typeof montoPagoRaw === 'number' ? montoPagoRaw : parseFloat(String(montoPagoRaw).replace(/\D/g, ''));
    
    const metodoPagoId = parseInt(this.fgPago.get('metodoPagoId')?.value, 10);
    
    const montoRecibidoRaw = this.fgPago.get('montoRecibido')?.value;
    let montoRecibido = montoRecibidoRaw ? (typeof montoRecibidoRaw === 'number' ? montoRecibidoRaw : parseFloat(String(montoRecibidoRaw).replace(/\D/g, ''))) : 0;

    const saldo = this.creditoSeleccionado.saldo ?? 0;

    if (!montoPago || montoPago <= 0) {
      this.dialogService.mostrar('El monto del abono debe ser mayor a 0.', 'warning');
      return;
    }

    if (montoPago > saldo) {
      this.dialogService.mostrar('El monto del pago no puede ser mayor al saldo pendiente.', 'warning');
      return;
    }

    if (!montoRecibido || montoRecibido === 0) {
      montoRecibido = montoPago;
    }

    if (montoRecibido < montoPago) {
      this.dialogService.mostrar('El monto recibido no puede ser menor al monto a pagar.', 'warning');
      return;
    }

    const datoPago = {
      facturaId: this.creditoSeleccionado.facturaId,
      metodoPagoId,
      Monto: montoPago,
      MontoRecibido: montoRecibido,
    };

    this.guardando = true;
    this.servicioPago.RegistrarPagoFactura(datoPago).subscribe({
      next: () => {
        this.guardando = false;
        const esPagoTotal = montoPago >= saldo;
        const msg = esPagoTotal
          ? `Crédito saldado. El crédito de la factura #${this.creditoSeleccionado!.facturaId} ha quedado en estado Pagado.`
          : `Abono de ${montoPago.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })} registrado correctamente.`;
        this.dialogService.mostrar(msg, 'success').then(() => {
          this.fgPago.reset();
          this.pagoRegistrado.emit();
          this.CerrarModal();
        });
      },
      error: (err: any) => {
        this.guardando = false;
        console.error('Error al registrar pago:', err);
        this.dialogService.mostrar(
          'Error al registrar el pago: ' + (err.error?.error?.message || 'Error desconocido'),
          'error'
        );
      }
    });
  }

  obtenerMetodosPago() {
    this.servicioMetodoPago.ObtenerMetodosPago().subscribe({
      next: (respuesta: MetodoPagoModel[]) => {
        this.metodosPago = respuesta;
        this.metodosPagoNombres = respuesta.map(m => m.Nombre || '').filter(Boolean);
      },
      error: (err) => {
        this.dialogService.mostrar('Error al obtener los métodos de pago.', 'error');
        console.error('Error:', err);
      }
    });
  }

  /** Calcula cuánto saldo queda después del abono ingresado. */
  calcularSaldoRestante(): number {
    const rawVal = this.fgPago.get('montoPago')?.value;
    const montoPago = typeof rawVal === 'number' ? rawVal : (rawVal ? parseFloat(String(rawVal).replace(/\D/g, '')) : 0);
    const saldo = this.creditoSeleccionado?.saldo ?? 0;
    return Math.max(0, saldo - montoPago);
  }

  // Getters para validaciones en el template
  get montoPago() { return this.fgPago.get('montoPago'); }
  get montoRecibido() { return this.fgPago.get('montoRecibido'); }
  get metodoPago() { return this.fgPago.get('metodoPagoId'); }
}
