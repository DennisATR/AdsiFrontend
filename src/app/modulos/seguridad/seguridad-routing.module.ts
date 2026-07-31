import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IdentificacionUsuarioComponent } from './identificacion-usuario/identificacion-usuario.component';
import { RecuperarClaveComponent } from './recuperar-clave/recuperar-clave.component';
import { CerrarSesionComponent } from './cerrar-sesion/cerrar-sesion.component';
import { CrearUsuarioComponent } from './usuario/crear-usuario/crear-usuario.component'; 
import { ValidarSesionInactivaGuard } from '../../guardianes/validar-sesion-inactiva.guard';
import { ValidarSesionActivaGuard } from '../../guardianes/validar-sesion-activa.guard';
import { ListarUsuarioComponent } from './usuario/listar-usuario/listar-usuario.component';
import { EliminarUsuarioComponent } from './usuario/eliminar-usuario/eliminar-usuario.component';
import { EditarUsuarioComponent } from './usuario/editar-usuario/editar-usuario.component';

const routes: Routes = [
  {
    path: 'identificar-usuario',
    component: IdentificacionUsuarioComponent,
    canActivate: [ValidarSesionInactivaGuard]
  },
  {
    path: 'recuperar-clave',
    component: RecuperarClaveComponent,
    canActivate: [ValidarSesionInactivaGuard]
  },
  {
    path: 'cerrar-sesion',
    component: CerrarSesionComponent,
    canActivate: [ValidarSesionActivaGuard]
  },
  {
    path: 'usuario/crear-usuario',
    component: CrearUsuarioComponent,
    canActivate: [ValidarSesionActivaGuard]
  },
  {
    path: 'usuario/listar-usuario',
    component: ListarUsuarioComponent,
    canActivate: [ValidarSesionActivaGuard]
  },
  {
    path: 'usuario/editar-usuario/:id',
    component: EditarUsuarioComponent,
    canActivate: [ValidarSesionActivaGuard]
  },
  {
    path: 'usuario/eliminar-usuario/:id',
    component: EliminarUsuarioComponent,
    canActivate: [ValidarSesionActivaGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SeguridadRoutingModule { }
