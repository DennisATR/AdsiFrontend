import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CrearZapatoComponent } from './zapato/crear-zapato/crear-zapato.component';
import { ValidarSesionActivaGuard } from '../../guardianes/validar-sesion-activa.guard';

const routes: Routes = [
  {
    path: 'zapato/crear-zapato',
    component: CrearZapatoComponent,
    canActivate: [ValidarSesionActivaGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParametrosRoutingModule { }
