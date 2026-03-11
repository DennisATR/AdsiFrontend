import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ValidarSesionActivaGuard } from '../../guardianes/validar-sesion-activa.guard';
import { CrearFacturaComponent } from './factura/crear-factura/crear-factura.component';
import { LineaVentaComponent } from './factura/linea-venta/linea-venta.component';
import { CierreCajaComponent } from './cierre-caja/cierre-caja.component';

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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VentasRoutingModule { }
