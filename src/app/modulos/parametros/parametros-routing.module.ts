import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CrearZapatoComponent } from './zapato/crear-zapato/crear-zapato.component';
import { CrearProveedorComponent } from './proveedor/crear-proveedor/crear-proveedor.component';
import { ListarZapatoComponent } from './zapato/listar-zapato/listar-zapato.component';
import { ValidarSesionActivaGuard } from '../../guardianes/validar-sesion-activa.guard';
import { ListarProveedorComponent } from './proveedor/listar-proveedor/listar-proveedor.component';
import { EliminarProveedorComponent } from './proveedor/eliminar-proveedor/eliminar-proveedor.component';
import { EditarProveedorComponent } from './proveedor/editar-proveedor/editar-proveedor.component';

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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParametrosRoutingModule { }
