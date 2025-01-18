import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IdentificacionUsuarioComponent } from './identificacion-usuario/identificacion-usuario.component';
import { CambioClaveComponent } from './cambio-clave/cambio-clave.component';
import { RecuperarClaveComponent } from './recuperar-clave/recuperar-clave.component';
import { CerrarSesionComponent } from './cerrar-sesion/cerrar-sesion.component';
import { CrearUsuarioComponent } from './usuario/crear-usuario/crear-usuario.component'; 
import { ValidarSesionInactivaGuard } from '../../guardianes/validar-sesion-inactiva.guard';
import { ValidarSesionActivaGuard } from '../../guardianes/validar-sesion-activa.guard';

const routes: Routes = [
  {
    path: 'identificar-usuario',
    component: IdentificacionUsuarioComponent,
    canActivate: [ValidarSesionInactivaGuard]
  },
  {
    path: 'cambio-clave',
    component: CambioClaveComponent,
    canActivate: [ValidarSesionActivaGuard]
  },
  {
    path: 'recuperar-clave',
    component: RecuperarClaveComponent,
    canActivate: [ValidarSesionInactivaGuard]
  },
  {
    path: 'cerrar-sesion',
    component:CerrarSesionComponent,
    canActivate: [ValidarSesionActivaGuard]
  },
  {
    path: 'usuario/crear-usuario',
    component: CrearUsuarioComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SeguridadRoutingModule { }
