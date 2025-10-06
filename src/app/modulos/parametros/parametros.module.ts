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
    EliminarClienteComponent
  ],
  imports: [
    CommonModule,
    ParametrosRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
  ]
})
export class ParametrosModule { }
