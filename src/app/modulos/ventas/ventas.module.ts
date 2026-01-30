import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VentasRoutingModule } from './ventas-routing.module';
import { SharedDirectivesModule } from '../../shared/shared-directives.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { CrearFacturaComponent } from './factura/crear-factura/crear-factura.component';
import { LineaVentaComponent } from './factura/linea-venta/linea-venta.component';


@NgModule({
  declarations: [
    CrearFacturaComponent,
    LineaVentaComponent
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
