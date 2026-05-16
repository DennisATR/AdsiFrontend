import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ValidarSesionActivaGuard } from '../../guardianes/validar-sesion-activa.guard';
import { CrearFacturaComponent } from './factura/crear-factura/crear-factura.component';
import { LineaVentaComponent } from './factura/linea-venta/linea-venta.component';
import { CierreCajaComponent } from './cierre-caja/cierre-caja.component';
import { TirillaComponent } from './tirilla/tirilla.component';
import { ListarCreditoComponent } from './credito/listar-credito/listar-credito.component';
import { EditarCreditoComponent } from './credito/editar-credito/editar-credito.component';
import { EliminarCreditoComponent } from './credito/eliminar-credito/eliminar-credito.component';
import { CrearDevolucionComponent } from './devolucion/crear-devolucion/crear-devolucion.component';

const routes: Routes = [
  {
    path: 'factura/crear-factura',
    component: CrearFacturaComponent,
    canActivate: [ValidarSesionActivaGuard]
  },
  {
    path: 'factura/linea-venta',
    component: LineaVentaComponent,
    canActivate: [ValidarSesionActivaGuard]
  },
  {
    path: 'cierre-caja',
    component: CierreCajaComponent,
    canActivate: [ValidarSesionActivaGuard]
  },
  {
    path: 'tirilla',
    component: TirillaComponent,
    canActivate: [ValidarSesionActivaGuard]
  },
  {
    path: 'credito/listar-credito',
    component: ListarCreditoComponent,
    canActivate: [ValidarSesionActivaGuard]
  },
  {
    path: 'credito/editar-credito',
    component: EditarCreditoComponent,
    canActivate: [ValidarSesionActivaGuard]
  },
  {
    path: 'credito/eliminar-credito',
    component: EliminarCreditoComponent,
    canActivate: [ValidarSesionActivaGuard]
  },
  {
    path: 'devolucion/crear-devolucion',
    component: CrearDevolucionComponent,
    canActivate: [ValidarSesionActivaGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VentasRoutingModule { }
