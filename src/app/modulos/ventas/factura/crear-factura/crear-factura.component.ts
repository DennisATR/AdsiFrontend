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
  almacenes: AlmacenModel[] = [];
  mostrarModalFinalizar: boolean = false;
  totalVenta: number = 0;

  constructor(
    private fb: FormBuilder,
    private servicioFactura: FacturaService,
    private servicioCliente: ClienteService,
    private servicioVendedor: VendedorService,
    private servicioVenta: VentaService,
    private servicioMetodoPago: MetodoPagoService,
    private servicioZapato: ZapatoService,
    private servicioInformacion: InformacionService
  ) { }

  ngOnInit() {
    this.ConstruirFormulario();
    this.establecerFechaActual();
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
      Fecha: ['', [Validators.required]],
      clienteId: ['', [Validators.required]],
      vendedorId: ['', [Validators.required]],
      metodoPagoId: ['', [Validators.required]],
      Abono: [0, [Validators.required, Validators.min(0)]],
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

  establecerFechaActual(): void {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    const fechaFormateada = `${año}-${mes}-${dia}`;
    this.fGroup.get('Fecha')?.setValue(fechaFormateada);
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
    this.establecerFechaActual();
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
    // Limpiar campos del modal si es necesario
    this.fGroup.patchValue({
      MetodoPagoNombre: '',
      metodoPagoId: '',
      Abono: 0,
      Nota: ''
    });
  }

  // Método para calcular el saldo pendiente
  calcularSaldoPendiente(): number {
    const abonoValue = this.fGroup.get('Abono')?.value;
    let abono = 0;

    if (abonoValue) {
      const abonoStr = abonoValue.toString().replace(/\./g, '');
      abono = parseFloat(abonoStr) || 0;
    }

    return this.totalVenta - abono;
  }

  confirmarVenta(): void {
    if (this.fGroup.get('metodoPagoId')?.invalid) {
      alert('Debe seleccionar un método de pago.');
      this.fGroup.get('metodoPagoId')?.markAsTouched();
      return;
    }

    const abonoValue = this.fGroup.get('Abono')?.value;
    let abono = 0;

    if (abonoValue) {
      const abonoStr = abonoValue.toString().replace(/\./g, '');
      abono = parseFloat(abonoStr) || 0;
    }

    if (abono < 0) {
      alert('El abono no puede ser negativo.');
      return;
    }

    if (abono > this.totalVenta) {
      alert('El abono no puede ser mayor al total de la venta.');
      return;
    }
    this.RegistrarFactura();
  }

    RegistrarFactura() {
    if (this.fGroup.invalid) {
      Object.keys(this.fGroup.controls).forEach(key => {
        this.fGroup.get(key)?.markAsTouched();
      });
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    if (this.lineasVenta.length === 0) {
      alert('Por favor agregue al menos un producto a la factura');
      return;
    }

    let campos = this.ObtenerFormGroup;
    const abonoValue = campos['Abono'].value;
    let abono = 0;
    if (abonoValue) {
      const abonoStr = abonoValue.toString().replace(/\./g, '');
      abono = parseFloat(abonoStr) || 0;
    }

    // Datos de la factura (sin las líneas)
    let datosFactura = {
      Fecha: new Date(campos['Fecha'].value).toISOString(),
      clienteId: parseInt(campos['clienteId'].value),
      vendedorId: campos['vendedorId'].value,
      metodoPagoId: parseInt(campos['metodoPagoId'].value),
      Abono: abono,
      Nota: campos['Nota'].value || '',
      Total: 0
    };

    console.log("📄 Datos de la factura a registrar:", datosFactura);

    // Paso 1: Registrar la factura
    this.servicioFactura.RegistrarFactura(datosFactura).subscribe({
      next: (respuestaFactura: any) => {
        console.log("✅ Factura registrada:", respuestaFactura);
        const facturaId = respuestaFactura.id;

        // Paso 2: Registrar cada línea de venta
        this.registrarLineasVenta(facturaId);
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

    registrarLineasVenta(facturaId: number) {
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

      this.servicioVenta.RegistrarVenta(ventaData).subscribe({
        next: (respuestaVenta: VentaModel) => {
          ventasRegistradas++;
          console.log(`✅ Línea ${index + 1} registrada:`, respuestaVenta);

          // Si todas las ventas se registraron correctamente
          if (ventasRegistradas === this.lineasVenta.length && !erroresEncontrados) {
            alert('Factura y líneas de venta registradas correctamente');
            this.cerrarModal();
            this.limpiarFormulario();
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

  submitOrFocusNext(currentField: HTMLElement) {
    currentField.blur();
    if (this.fGroup.valid) {
      this.RegistrarFactura();
    } else {
      for (const controlName in this.fGroup.controls) {
        const control = this.fGroup.get(controlName);
        if (control && control.invalid) {
          const invalidField = document.getElementById(controlName);
          if (invalidField) {
            invalidField.focus();
          }
          break;
        }
      }
    }
  }
}