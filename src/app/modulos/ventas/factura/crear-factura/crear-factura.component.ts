// Agregar estas importaciones al inicio del archivo
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FacturaService } from '../../../../servicios/ventas/factura.service';
import { FacturaModel } from '../../../../modelos/factura.model';
import { ClienteModel } from '../../../../modelos/cliente.model';
import { VendedorModel } from '../../../../modelos/vendedor.model';
import { MetodoPagoModel } from '../../../../modelos/metodoPago.model';
import { ClienteService } from '../../../../servicios/parametros/cliente.service';
import { VendedorService } from '../../../../servicios/parametros/vendedor.service';
import { MetodoPagoService } from '../../../../servicios/ventas/metodo-pago.service';
import { ZapatoService } from '../../../../servicios/parametros/zapato.service';
import { ZapatoModel } from '../../../../modelos/zapato.model';
import { VentaModel } from '../../../../modelos/venta.model';
import { LineaVentaComponent } from '../linea-venta/linea-venta.component';
import { VentaService } from '../../../../servicios/ventas/venta.service';
import { InformacionService } from '../../../../servicios/parametros/informacion.service';
import { AlmacenModel } from '../../../../modelos/almacen.model';
import { PagoFacturaService } from '../../../../servicios/ventas/pago-factura.service';
import { CreditoService } from '../../../../servicios/ventas/credito.service';
import { CreditoModel } from '../../../../modelos/credito.model';
import { PrintService } from '../../../../servicios/ventas/print.service';

@Component({
  selector: 'app-crear-factura',
  templateUrl: './crear-factura.component.html',
  styleUrl: './crear-factura.component.css'
})
export class CrearFacturaComponent implements OnInit {
  @ViewChild(LineaVentaComponent) lineaVentaComponent!: LineaVentaComponent;

  fGroup: FormGroup = new FormGroup({});
  lineasVenta: VentaModel[] = [];
  totalFactura: number = 0;

  clientes: ClienteModel[] = [];
  clientesNombres: string[] = [];
  vendedores: VendedorModel[] = [];
  vendedoresNombres: string[] = [];
  metodosPago: MetodoPagoModel[] = [];
  metodosPagoNombres: string[] = [];
  tiposVentaNombres: string[] = ['Contado', 'Crédito'];
  almacenes: AlmacenModel[] = [];
  mostrarModalFinalizar: boolean = false;
  totalVenta: number = 0;
  
  // Múltiples pagos
  pagosAplicados: Array<{metodoPagoId: number, monto: number}> = [];
  metodoPagoActualNombre: string = '';
  abonoActual: number = 0;
  permitirMultiplesPagos: boolean = true;
  lugarImpresion: string = 'servidor';

  constructor(
    private fb: FormBuilder,
    private servicioFactura: FacturaService,
    private servicioCliente: ClienteService,
    private servicioVendedor: VendedorService,
    private servicioVenta: VentaService,
    private servicioMetodoPago: MetodoPagoService,
    private servicioZapato: ZapatoService,
    private servicioInformacion: InformacionService,
    private servicioPagoFactura: PagoFacturaService,
    private servicioCredito: CreditoService,
    private printService: PrintService
  ) { }

  ngOnInit() {
    this.ConstruirFormulario();
    this.obtenerClientes();
    this.obtenerVendedores();
    this.obtenerMetodosPago();
    this.obtenerAlmacenes();
  }

  get ObtenerFormGroup() {
    return this.fGroup.controls;
  }

  ConstruirFormulario() {
    this.fGroup = this.fb.group({
      clienteId: ['', [Validators.required]],
      vendedorId: ['', [Validators.required]],
      metodoPagoId: ['', [Validators.required]],
      tipoVenta: ['contado', [Validators.required]],
      TipoVentaNombre: ['Contado', [Validators.required]],
      Abono: [0, [Validators.min(0)]],
      Nota: [''],
      ClienteNombre: ['', Validators.required],
      VendedorNombre: ['', Validators.required],
      MetodoPagoNombre: ['', Validators.required],
      zapatoId: [''],
      Descripcion: [''],
      Categoria: [''],
      Talla: [''],
      Color: [''],
      Referencia: [''],
      PrecioVentaMin: [0],
      PrecioVentaMax: [0],
      PrecioVenta: [0],
      CantidadDisponible: [0],
      CantidadVenta: [0]
    });
  }

  agregarProducto(): void {
    const zapatoId = this.fGroup.get('zapatoId')?.value;
    const cantidad = this.fGroup.get('CantidadVenta')?.value;
    const precioValue = this.fGroup.get('PrecioVenta')?.value;

    if (!zapatoId || !cantidad || !precioValue) {
      alert('Por favor complete los campos: ID Zapato, Cantidad y Precio');
      return;
    }

    if (cantidad <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }

    // Procesar el precio
    let precio = precioValue;
    if (typeof precioValue === 'string') {
      precio = parseFloat(precioValue.replace(/\./g, ''));
    } else {
      precio = parseFloat(precioValue);
    }

    if (precio <= 0) {
      alert('El precio debe ser mayor a 0');
      return;
    }

    const almacenId = this.obtenerAlmacenIdDesdePrefijo(zapatoId);
    if (!almacenId) {
      alert('No se encontró un almacén para el prefijo del zapato. Verifique el ID y la configuración de almacenes.');
      return;
    }

    const nuevaVenta: VentaModel = {
      zapatoId: zapatoId,
      Cantidad: parseInt(cantidad),
      Precio: precio,
      almacenId: almacenId
    };

    // Agregar al array local
    this.lineasVenta.push(nuevaVenta);

    // Si el componente hijo ya está inicializado, llamar su método
    if (this.lineaVentaComponent) {
      this.lineaVentaComponent.actualizarTotal();
    }

    console.log('✅ Producto agregado. Total:', this.totalFactura);
    console.log('📦 Líneas actuales:', this.lineasVenta);

    this.limpiarCamposProducto();
  }

  limpiarCamposProducto(): void {
    this.fGroup.patchValue({
      zapatoId: '',
      Descripcion: '',
      Categoria: '',
      Talla: '',
      Color: '',
      Referencia: '',
      PrecioVentaMin: 0,
      PrecioVentaMax: 0,
      PrecioVenta: 0,
      CantidadDisponible: 0,
      CantidadVenta: 0
    });
  }

  actualizarTotal(total: number = 0): void {
    this.totalFactura = total;
  }

  onActualizarLineas(lineas: VentaModel[]): void {
    this.lineasVenta = lineas;
  }

  onActualizarTotal(total: number): void {
    this.totalFactura = total;
  }

  limpiarFormulario(): void {
    this.fGroup.reset();
    this.lineasVenta = [];
    this.totalFactura = 0;
    this.pagosAplicados = [];
    this.metodoPagoActualNombre = '';
    this.abonoActual = 0;
    this.fGroup.patchValue({ Abono: 0 });
  }

  cancelarFactura(): void {
    if (confirm('¿Está seguro que desea cancelar? Se perderán todos los datos no guardados.')) {
      this.limpiarFormulario();
    }
  }

  obtenerClientes() {
    this.servicioCliente.ObtenerClientes().subscribe({
      next: (respuesta: ClienteModel[]) => {
        this.clientes = respuesta;
        this.clientesNombres = this.clientes.map(
          c => `${c.Nombre} (ID: ${c.id})`
        );
      },
      error: (err) => {
        alert('Error al obtener los clientes');
        console.error('Error:', err);
      }
    });
  }

  onClienteSeleccionado(nombreCompleto: string): void {
    const match = nombreCompleto.match(/\(ID:\s*(\d+)\)/);
    if (match) {
      const clienteId = match[1];
      this.fGroup.get('clienteId')?.setValue(clienteId);
    }
  }

  obtenerVendedores() {
    this.servicioVendedor.ObtenerVendedores().subscribe({
      next: (respuesta: VendedorModel[]) => {
        this.vendedores = respuesta;
        this.vendedoresNombres = this.vendedores.map(
          v => `${v.Nombre} (ID: ${v.id})`
        );
      },
      error: (err) => {
        alert('Error al obtener los vendedores');
        console.error('Error:', err);
      }
    });
  }

  obtenerAlmacenes() {
    this.servicioInformacion.ObtenerAlmacenes().subscribe({
      next: (respuesta: AlmacenModel[]) => {
        this.almacenes = respuesta || [];
        console.log('🏬 Almacenes cargados:', this.almacenes);
      },
      error: (err) => {
        this.almacenes = [];
        console.error('Error al obtener almacenes:', err);
      }
    });
  }

  obtenerAlmacenIdDesdePrefijo(zapatoId: string): number | null {
    if (!zapatoId) {
      return null;
    }

    if (!this.almacenes || this.almacenes.length === 0) {
      console.warn('⚠️ No hay almacenes cargados al intentar buscar por prefijo.');
      return null;
    }

    const prefijoZapato = zapatoId.toString().trim().substring(0, 3).toUpperCase();
    if (!prefijoZapato || prefijoZapato.length < 3) {
      return null;
    }

    const almacen = this.almacenes.find(a =>
      (a.Prefijo || '').toString().trim().toUpperCase() === prefijoZapato
    );
    console.log(`🔍 Buscando almacén para prefijo "${prefijoZapato}":`, almacen);

    return almacen?.id || null;
  }

  obtenerZapato() {
    const zapatoId = this.fGroup.get('zapatoId')?.value;
    if (!zapatoId) {
      alert('Por favor ingrese un ID de zapato válido.');
      return;
    }
    this.servicioZapato.BuscarZapato(zapatoId).subscribe({
      next: (respuesta: ZapatoModel) => {
        this.fGroup.patchValue({
          Descripcion: respuesta.Descripcion || '',
          Categoria: respuesta.Categoria || '',
          Talla: respuesta.Talla || '',
          Color: respuesta.Color || '',
          Referencia: respuesta.Referencia || '',
          PrecioVentaMin: respuesta.PrecioVentaMin || 0,
          PrecioVentaMax: respuesta.PrecioVentaMax || 0,
          CantidadDisponible: respuesta.Cantidad || 0
        });

        setTimeout(() => {
          const precioVentaInput = document.getElementById('PrecioVenta');
          if (precioVentaInput) {
            precioVentaInput.focus();
          }
        }, 100);
      },
      error: (err) => {
        alert('No se encontró el zapato con ese ID');
        console.error('Error:', err);
      }
    });
  }

  onVendedorSeleccionado(nombreCompleto: string): void {
    const match = nombreCompleto.match(/\(ID:\s*(\d+)\)/);
    if (match) {
      const vendedorId = match[1];
      this.fGroup.get('vendedorId')?.setValue(vendedorId);
    }
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
      this.fGroup.get('metodoPagoId')?.setValue(metodoPagoId);
    }
  }

  onTipoVentaSeleccionado(tipo: string): void {
    const tipoVentaValor = tipo.toLowerCase() === 'contado' ? 'contado' : 'credito';
    this.fGroup.get('tipoVenta')?.setValue(tipoVentaValor);
    
    // Limpiar pagos aplicados y configurar si se permiten múltiples pagos
    this.pagosAplicados = [];
    this.permitirMultiplesPagos = tipoVentaValor === 'contado';
    
    // Limpiar campos de pago
    this.fGroup.patchValue({
      MetodoPagoNombre: '',
      metodoPagoId: '',
      Abono: 0
    });
    
    console.log(`💳 Tipo de venta seleccionado: ${tipoVentaValor}, permitirMultiplesPagos: ${this.permitirMultiplesPagos}`);
  }

  abrirModalFinalizar(): void {
    // Validar que haya productos agregados
    if (!this.lineasVenta || this.lineasVenta.length === 0) {
      alert('Debe agregar al menos un producto para finalizar la venta.');
      return;
    }

    // Validar cliente y vendedor
    if (this.fGroup.get('clienteId')?.invalid || this.fGroup.get('vendedorId')?.invalid) {
      alert('Debe seleccionar un cliente y un vendedor.');
      this.fGroup.get('clienteId')?.markAsTouched();
      this.fGroup.get('vendedorId')?.markAsTouched();
      return;
    }

    // Establecer el total de venta antes de abrir el modal
    this.totalVenta = this.totalFactura;

    // Abrir el modal
    this.mostrarModalFinalizar = true;
  }

  // Método para cerrar el modal
  cerrarModal(): void {
    this.mostrarModalFinalizar = false;
    // Limpiar campos del modal
    this.pagosAplicados = [];
    this.fGroup.patchValue({
      tipoVenta: 'contado',
      TipoVentaNombre: 'Contado',
      MetodoPagoNombre: '',
      metodoPagoId: '',
      Abono: 0,
      Nota: ''
    });
  }

  // Método para calcular el saldo pendiente
  calcularSaldoPendiente(): number {
    const totalPagado = this.pagosAplicados.reduce((sum, pago) => sum + pago.monto, 0);
    return this.totalVenta - totalPagado;
  }

  agregarPago(): void {
    // Validar que no haya un pago en crédito ya agregado
    if (!this.permitirMultiplesPagos && this.pagosAplicados.length > 0) {
      alert('En crédito solo se permite un pago. Confirme la venta para finalizarla.');
      return;
    }

    if (this.fGroup.get('metodoPagoId')?.invalid) {
      alert('Debe seleccionar un método de pago.');
      return;
    }

    let abonoValue = this.fGroup.get('Abono')?.value || 0;
    let abono = 0;

    if (abonoValue) {
      const abonoStr = abonoValue.toString().replace(/\./g, '');
      abono = parseFloat(abonoStr) || 0;
    }

    if (abono <= 0) {
      alert('El monto del pago debe ser mayor a 0.');
      return;
    }

    const saldoPendiente = this.calcularSaldoPendiente();
    if (abono > saldoPendiente) {
      alert(`El pago no puede exceder el saldo pendiente de $${saldoPendiente}`);
      return;
    }

    const metodoPagoId = parseInt(this.fGroup.get('metodoPagoId')?.value);
    
    // Agregar el pago al array
    this.pagosAplicados.push({
      metodoPagoId: metodoPagoId,
      monto: abono
    });

    console.log('✅ Pago agregado:', {metodoPagoId, monto: abono});
    console.log('📋 Pagos aplicados:', this.pagosAplicados);

    // Limpiar campos para un nuevo pago (solo en contado)
    if (this.permitirMultiplesPagos) {
      this.fGroup.patchValue({
        MetodoPagoNombre: '',
        metodoPagoId: '',
        Abono: 0
      });
    }
  }

  eliminarPago(index: number): void {
    this.pagosAplicados.splice(index, 1);
    console.log('❌ Pago eliminado. Pagos restantes:', this.pagosAplicados);
  }

  obtenerNombreMetodoPago(metodoPagoId: number): string {
    const metodo = this.metodosPago.find(m => m.id === metodoPagoId);
    return metodo?.Nombre || 'N/A';
  }

  obtenerTotalPagado(): number {
    return this.pagosAplicados.reduce((sum, pago) => sum + pago.monto, 0);
  }

  estaCompletoElPago(): boolean {
    return this.obtenerTotalPagado() === this.totalVenta;
  }

  puedeContinuar(): boolean {
    const tipoVenta = this.fGroup.get('tipoVenta')?.value || 'contado';
    
    // Necesita método de pago seleccionado
    if (!this.fGroup.get('metodoPagoId')?.valid) {
      return false;
    }

    // Obtener el abono ingresado
    const abonoValue = this.fGroup.get('Abono')?.value || 0;
    let abono = 0;
    
    if (abonoValue) {
      const abonoStr = abonoValue.toString().replace(/\./g, '');
      abono = parseFloat(abonoStr) || 0;
    }

    if (tipoVenta === 'contado') {
      // CONTADO: requiere pagos agregados O abono exacto al total
      if (this.pagosAplicados.length === 0) {
        // Sin pagos agregados: abono debe ser 0 o exacto al total
        return abono === 0 || abono === this.totalVenta;
      }
      // Con pagos: el saldo debe ser 0
      return this.calcularSaldoPendiente() === 0;
    } else {
      // CRÉDITO: solo requiere abono > 0 (puede ser parcial)
      return abono > 0;
    }
  }

  confirmarVenta(): void {
    const tipoVenta = this.fGroup.get('tipoVenta')?.value || 'contado';
    
    // Si no hay pagos registrados, verifica si hay un abono manual
    if (this.pagosAplicados.length === 0) {
      if (this.fGroup.get('metodoPagoId')?.invalid) {
        alert('Debe seleccionar un método de pago.');
        return;
      }

      // Obtener el abono ingresado manualmente
      const abonoValue = this.fGroup.get('Abono')?.value || 0;
      let abono = 0;
      
      if (abonoValue) {
        const abonoStr = abonoValue.toString().replace(/\./g, '');
        abono = parseFloat(abonoStr) || 0;
      }

      // Validaciones según tipo de venta
      if (tipoVenta === 'contado') {
        // Para CONTADO: el abono debe ser exacto al total o 0
        if (abono > 0 && abono !== this.totalVenta) {
          alert(`El abono ingresado ($${abono}) no es exacto al total ($${this.totalVenta}).`);
          return;
        }
        
        // Crear un pago único con el total de la venta
        const metodoPagoId = parseInt(this.fGroup.get('metodoPagoId')?.value);
        this.pagosAplicados.push({
          metodoPagoId: metodoPagoId,
          monto: this.totalVenta
        });
        console.log('✅ Pago único registrado automáticamente:', this.pagosAplicados);
      } else if (tipoVenta === 'credito') {
        // Para CRÉDITO: el abono puede ser menor que el total
        if (abono < 0) {
          alert('El abono no puede ser negativo.');
          return;
        }
        
        if (abono > this.totalVenta) {
          alert(`El abono ($${abono}) no puede ser mayor al total ($${this.totalVenta}).`);
          return;
        }

        // Si hay abono, crear un pago con ese monto
        if (abono > 0) {
          const metodoPagoId = parseInt(this.fGroup.get('metodoPagoId')?.value);
          this.pagosAplicados.push({
            metodoPagoId: metodoPagoId,
            monto: abono
          });
          console.log('✅ Pago inicial registrado para crédito:', this.pagosAplicados);
        }
      }
    }

    // Para CONTADO: validar que el total de pagos sea exacto
    // Para CRÉDITO: el saldo pendiente será registrado como crédito
    if (tipoVenta === 'contado') {
      const totalPagado = this.obtenerTotalPagado();
      if (totalPagado !== this.totalVenta) {
        alert(`El total de pagos ($${totalPagado}) debe ser exacto al total de la venta ($${this.totalVenta}). Saldo pendiente: $${this.calcularSaldoPendiente()}`);
        return;
      }
    }

    this.RegistrarFactura();
  }

  RegistrarFactura() {
    // Si hay múltiples pagos, solo valida los campos básicos de factura
    if (this.pagosAplicados.length > 1) {
      if (!this.fGroup.get('clienteId')?.value || !this.fGroup.get('vendedorId')?.value) {
        alert('Debe seleccionar cliente y vendedor.');
        return;
      }
    } else {
      // Si es pago único, valida el formulario completo
      if (this.fGroup.invalid) {
        Object.keys(this.fGroup.controls).forEach(key => {
          this.fGroup.get(key)?.markAsTouched();
        });
        alert('Por favor complete todos los campos obligatorios');
        return;
      }
    }

    if (this.lineasVenta.length === 0) {
      alert('Por favor agregue al menos un producto a la factura');
      return;
    }

    let campos = this.ObtenerFormGroup;

    // Calcular el total de facturas sumando las líneas de venta
    const totalFactura = this.lineasVenta.reduce((sum, linea) => {
      const cantidad = linea.Cantidad || 0;
      const precio = linea.Precio || 0;
      return sum + (cantidad * precio);
    }, 0);

    // Datos de la factura (sin Abono ni metodoPagoId - estos son datos del pago)
    let datosFactura = {
      clienteId: parseInt(campos['clienteId'].value),
      vendedorId: campos['vendedorId'].value,
      Nota: campos['Nota'].value || '',
      Total: totalFactura
    };

    console.log("📄 Datos de la factura a registrar:", datosFactura);

    // Paso 1: Registrar la factura
    this.servicioFactura.RegistrarFactura(datosFactura).subscribe({
      next: (respuestaFactura: any) => {
        console.log("✅ Factura registrada:", respuestaFactura);
        const facturaId = respuestaFactura.id;

        // Paso 2: Registrar cada línea de venta
        this.registrarLineasVenta(facturaId, totalFactura);
      },
      error: (err: any) => {
        if (err.error && err.error.error && err.error.error.message) {
          alert('Error al registrar factura: ' + err.error.error.message);
        } else {
          alert('Ocurrió un error al registrar la factura.');
        }
        console.error('❌ Error al registrar factura:', err);
      }
    });
  }

  registrarLineasVenta(facturaId: number, totalFactura: number) {
    let ventasRegistradas = 0;
    let erroresEncontrados = false;

    console.log(`📦 Registrando ${this.lineasVenta.length} líneas de venta...`);

    // Iterar sobre cada línea de venta
    this.lineasVenta.forEach((linea, index) => {
      const ventaData: VentaModel = {
        Cantidad: linea.Cantidad,
        Precio: linea.Precio,
        almacenId: linea.almacenId,
        zapatoId: linea.zapatoId,
        facturaId: facturaId
      };

      this.servicioVenta.RegistrarVenta(ventaData, this.lugarImpresion).subscribe({
        next: (respuestaVenta: VentaModel) => {
          ventasRegistradas++;
          console.log(`✅ Línea ${index + 1} registrada:`, respuestaVenta);

          // Si todas las ventas se registraron correctamente
          if (ventasRegistradas === this.lineasVenta.length && !erroresEncontrados) {
            // Paso 3: Registrar todos los pagos
            this.registrarMultiplesPagos(facturaId);
          }
        },
        error: (err: any) => {
          erroresEncontrados = true;
          console.error(`❌ Error al registrar línea ${index + 1}:`, err);
          
          // Mostrar error solo una vez
          if (ventasRegistradas + 1 === this.lineasVenta.length) {
            alert('La factura se creó pero hubo errores al registrar algunas líneas de venta. Por favor verifique.');
          }
        }
      });
    });
  }

  registrarMultiplesPagos(facturaId: number) {
    console.log(`💳 Registrando ${this.pagosAplicados.length} pagos...`);
    
    let pagosRegistrados = 0;
    let erroresEncontrados = false;

    // Si no hay pagos, ir directamente a registrar crédito si es necesario
    if (this.pagosAplicados.length === 0) {
      this.registrarCreditoSiEsNecesario(facturaId);
      return;
    }

    this.pagosAplicados.forEach((pago, index) => {
      const datoPago = {
        facturaId: facturaId,
        metodoPagoId: pago.metodoPagoId,
        Monto: pago.monto
      };

      console.log(`💳 Registrando pago ${index + 1}:`, datoPago);

      this.servicioPagoFactura.RegistrarPagoFactura(datoPago).subscribe({
        next: (respuestaPago: any) => {
          pagosRegistrados++;
          console.log(`✅ Pago ${index + 1} registrado:`, respuestaPago);

          // Si todos los pagos se registraron correctamente
          if (pagosRegistrados === this.pagosAplicados.length && !erroresEncontrados) {
            // Registrar crédito si es necesario
            this.registrarCreditoSiEsNecesario(facturaId);
          }
        },
        error: (err: any) => {
          erroresEncontrados = true;
          console.error(`❌ Error al registrar pago ${index + 1}:`, err);
          alert(`La factura y líneas se crearon pero hubo error al registrar el pago ${index + 1}. Por favor registre los pagos manualmente.`);
          this.cerrarModal();
          this.limpiarFormulario();
        }
      });
    });
  }

  registrarCreditoSiEsNecesario(facturaId: number) {
    const tipoVenta = this.fGroup.get('tipoVenta')?.value || 'contado';

    // Si es crédito y hay saldo pendiente
    if (tipoVenta === 'credito') {
      const totalPagado = this.obtenerTotalPagado();
      const saldoPendiente = this.totalVenta - totalPagado;

      if (saldoPendiente > 0) {
        const datosCredito = {
          facturaId: facturaId,
          Estado: 'Pendiente'
        };

        console.log(`💰 Registrando crédito:`, datosCredito);

        this.servicioCredito.RegistrarCredito(datosCredito).subscribe({
          next: (respuestaCredito: any) => {
            console.log(`✅ Crédito registrado:`, respuestaCredito);
            alert('✅ Factura, líneas, pagos y crédito registrados correctamente');
            this.procesarImpresionLocalSiEsNecesario(facturaId);
          },
          error: (err: any) => {
            console.error(`❌ Error al registrar crédito:`, err);
            alert('✅ Factura, líneas y pagos registrados. ⚠️ Error al registrar el crédito. Por favor registre manualmente.');
            this.procesarImpresionLocalSiEsNecesario(facturaId);
          }
        });
      } else {
        // No hay saldo pendiente
        alert('✅ Factura, líneas de venta y todos los pagos registrados correctamente');
        this.procesarImpresionLocalSiEsNecesario(facturaId);
      }
    } else {
      // Es CONTADO
      alert('✅ Factura, líneas de venta y todos los pagos registrados correctamente');
      this.procesarImpresionLocalSiEsNecesario(facturaId);
    }
  }

  procesarImpresionLocalSiEsNecesario(facturaId: number) {
    if (this.lugarImpresion === 'cliente') {
      this.printService.obtenerBufferFactura(facturaId).subscribe({
        next: (res) => {
          this.printService.imprimirLocal(res.buffer).subscribe({
            next: () => console.log('Impresión enviada al agente local'),
            error: (err) => alert('No se pudo comunicar con el agente de impresión local. Asegúrate de que el script se está ejecutando.')
          });
        },
        error: (err) => console.error('Error al obtener buffer:', err)
      });
    }
    this.cerrarModal();
    this.limpiarFormulario();
  }

  registrarPagoFactura(facturaId: number, metodoPagoId: number, monto: number) {
    const datoPago = {
      facturaId: facturaId,
      metodoPagoId: metodoPagoId,
      Monto: monto
    };

    console.log("💳 Registrando pago:", datoPago);

    this.servicioPagoFactura.RegistrarPagoFactura(datoPago).subscribe({
      next: (respuestaPago: any) => {
        console.log("✅ Pago registrado:", respuestaPago);
        alert('Factura, líneas de venta y pago registrados correctamente');
        this.cerrarModal();
        this.limpiarFormulario();
      },
      error: (err: any) => {
        console.error('❌ Error al registrar pago:', err);
        alert('La factura y líneas se crearon pero hubo error al registrar el pago. Por favor registre el pago manualmente.');
        this.cerrarModal();
        this.limpiarFormulario();
      }
    });
  }

  focusNext(currentField: HTMLElement, nextField?: HTMLElement) {
    const fieldName = currentField.id || currentField.getAttribute('formControlName') || '';

    if (this.fGroup.get(fieldName)?.valid) {
      currentField.blur();
      if (nextField) {
        nextField.focus();
      }
    } else {
      currentField.focus();
      this.fGroup.get(fieldName)?.markAsTouched();
    }
  }
}