import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VentasRoutingModule } from './ventas-routing.module';
import { SharedDirectivesModule } from '../../shared/shared-directives.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { CrearFacturaComponent } from './factura/crear-factura/crear-factura.component';
import { LineaVentaComponent } from './factura/linea-venta/linea-venta.component';
import { CierreCajaComponent } from './cierre-caja/cierre-caja.component';
import { TirillaComponent } from './tirilla/tirilla.component';
import { EditarCreditoComponent } from './credito/editar-credito/editar-credito.component';
import { ListarCreditoComponent } from './credito/listar-credito/listar-credito.component';
import { EliminarCreditoComponent } from './credito/eliminar-credito/eliminar-credito.component';


@NgModule({
  declarations: [
    CrearFacturaComponent,
    LineaVentaComponent,
    CierreCajaComponent,
    TirillaComponent,
    EditarCreditoComponent,
    ListarCreditoComponent,
    EliminarCreditoComponent,
  ],
  imports: [
    CommonModule,
    VentasRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
    SharedDirectivesModule
  ]
})
export class VentasModule { }
