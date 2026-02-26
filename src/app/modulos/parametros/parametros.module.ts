import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ParametrosRoutingModule } from './parametros-routing.module';
import { CrearZapatoComponent } from './zapato/crear-zapato/crear-zapato.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { CrearProveedorComponent } from './proveedor/crear-proveedor/crear-proveedor.component';
import { ListarZapatoComponent } from './zapato/listar-zapato/listar-zapato.component';
import { ListarProveedorComponent } from './proveedor/listar-proveedor/listar-proveedor.component';
import { EliminarProveedorComponent } from './proveedor/eliminar-proveedor/eliminar-proveedor.component';
import { EditarProveedorComponent } from './proveedor/editar-proveedor/editar-proveedor.component';
import { EliminarZapatoComponent } from './zapato/eliminar-zapato/eliminar-zapato.component';
import { EditarZapatoComponent } from './zapato/editar-zapato/editar-zapato.component';
import { CrearClienteComponent } from './cliente/crear-cliente/crear-cliente.component';
import { ListarClienteComponent } from './cliente/listar-cliente/listar-cliente.component';
import { EditarClienteComponent } from './cliente/editar-cliente/editar-cliente.component';
import { EliminarClienteComponent } from './cliente/eliminar-cliente/eliminar-cliente.component';
import { CrearGastoComponent } from './gasto/crear-gasto/crear-gasto.component';
import { ListarGastoComponent } from './gasto/listar-gasto/listar-gasto.component';
import { EliminarGastoComponent } from './gasto/eliminar-gasto/eliminar-gasto.component';
import { EditarGastoComponent } from './gasto/editar-gasto/editar-gasto.component';
import { SharedDirectivesModule } from '../../shared/shared-directives.module';
import { EliminarEntregaComponent } from './entrega/eliminar-entrega/eliminar-entrega.component';
import { CrearEntregaComponent } from './entrega/crear-entrega/crear-entrega.component';
import { EditarEntregaComponent } from './entrega/editar-entrega/editar-entrega.component';
import { ListarEntregaComponent } from './entrega/listar-entrega/listar-entrega.component';
import { CrearVendedorComponent } from './vendedor/crear-vendedor/crear-vendedor.component';
import { EditarVendedorComponent } from './vendedor/editar-vendedor/editar-vendedor.component';
import { EliminarVendedorComponent } from './vendedor/eliminar-vendedor/eliminar-vendedor.component';
import { ListarVendedorComponent } from './vendedor/listar-vendedor/listar-vendedor.component';
import { InformacionComponent } from './informacion/informacion.component';



@NgModule({
  declarations: [
    CrearZapatoComponent,
    CrearProveedorComponent,
    ListarZapatoComponent,
    ListarProveedorComponent,
    EliminarProveedorComponent,
    EditarProveedorComponent,
    EliminarZapatoComponent,
    EditarZapatoComponent,
    CrearClienteComponent,
    ListarClienteComponent,
    EditarClienteComponent,
    EliminarClienteComponent,
    CrearGastoComponent,
    ListarGastoComponent,
    EliminarGastoComponent,
    EditarGastoComponent,
    CrearEntregaComponent,
    ListarEntregaComponent,
    EditarEntregaComponent,
    EliminarEntregaComponent,
    CrearVendedorComponent,
    ListarVendedorComponent,
    EditarVendedorComponent,
    EliminarVendedorComponent,
    InformacionComponent
  ],
  imports: [
    CommonModule,
    ParametrosRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
    SharedDirectivesModule
  ]
})
export class ParametrosModule { }
