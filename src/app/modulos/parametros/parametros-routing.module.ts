import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CrearZapatoComponent } from './zapato/crear-zapato/crear-zapato.component';
import { CrearProveedorComponent } from './proveedor/crear-proveedor/crear-proveedor.component';
import { ListarZapatoComponent } from './zapato/listar-zapato/listar-zapato.component';
import { ValidarSesionActivaGuard } from '../../guardianes/validar-sesion-activa.guard';
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
import { EditarGastoComponent } from './gasto/editar-gasto/editar-gasto.component';
import { EliminarGastoComponent } from './gasto/eliminar-gasto/eliminar-gasto.component';

const routes: Routes = [
  {
    path: 'zapato/crear-zapato',
    component: CrearZapatoComponent,
    canActivate: [ValidarSesionActivaGuard]
  },
  {
    path: 'proveedor/crear-proveedor',
    component: CrearProveedorComponent,
    canActivate: [ValidarSesionActivaGuard]
  },
  {
    path: 'zapato/listar-zapato',
    component: ListarZapatoComponent,
    canActivate: [ValidarSesionActivaGuard]
  },
  {
    path: 'proveedor/listar-proveedor',
    component: ListarProveedorComponent,
    canActivate: [ValidarSesionActivaGuard]
  },
  {
    path:"proveedor/eliminar-proveedor/:id",
    component: EliminarProveedorComponent,
    canActivate:[ValidarSesionActivaGuard]
  },
  {
    path: 'proveedor/editar-proveedor/:id',
    component: EditarProveedorComponent,
    canActivate: [ValidarSesionActivaGuard]
  },
  
  {
    path: 'zapato/eliminar-zapato/:id',
    component: EliminarZapatoComponent,
    canActivate: [ValidarSesionActivaGuard]
  },

  {
    path: 'zapato/editar-zapato/:id',
    component: EditarZapatoComponent,
    canActivate: [ValidarSesionActivaGuard]
  },

  {
    path: 'cliente/crear-cliente',
    component: CrearClienteComponent,
    canActivate: [ValidarSesionActivaGuard]
  },
  {
    path: 'cliente/listar-cliente',
    component: ListarClienteComponent,
    canActivate: [ValidarSesionActivaGuard]
  },
  {
    path: 'cliente/editar-cliente/:id',
    component: EditarClienteComponent,
    canActivate: [ValidarSesionActivaGuard]
  },
  {
    path: 'cliente/eliminar-cliente/:id',
    component: EliminarClienteComponent,
    canActivate: [ValidarSesionActivaGuard]
  },
  {
    path: 'gasto/crear-gasto',
    component: CrearGastoComponent,
    canActivate: [ValidarSesionActivaGuard]
  },
  {
    path: 'gasto/listar-gasto',
    component: ListarGastoComponent,
    canActivate: [ValidarSesionActivaGuard]
  },
  {
    path: 'gasto/eliminar-gasto/:id',
    component: EliminarGastoComponent,
    canActivate: [ValidarSesionActivaGuard]
  },
  {
    path: 'gasto/editar-gasto/:id',
    component: EditarGastoComponent,
    canActivate: [ValidarSesionActivaGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParametrosRoutingModule { }
