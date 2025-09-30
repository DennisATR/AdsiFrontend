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


@NgModule({
  declarations: [
    CrearZapatoComponent,
    CrearProveedorComponent,
    ListarZapatoComponent,
    ListarProveedorComponent,
    EliminarProveedorComponent,
    EditarProveedorComponent,
    EliminarZapatoComponent,
    EditarZapatoComponent
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
