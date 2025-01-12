import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IdentificacionUsuarioComponent } from './identificacion-usuario/identificacion-usuario.component';
import { CambioClaveComponent } from './cambio-clave/cambio-clave.component';
import { RecuperarClaveComponent } from './recuperar-clave/recuperar-clave.component';
import { CerrarSesionComponent } from './cerrar-sesion/cerrar-sesion.component';
import { CrearUsuarioComponent } from './usuario/crear-usuario/crear-usuario.component'; 

const routes: Routes = [
  {
    path: 'identificar-usuario',
    component: IdentificacionUsuarioComponent,
  },
  {
    path: 'cambio-clave',
    component: CambioClaveComponent,
  },
  {
    path: 'recuperar-clave',
    component: RecuperarClaveComponent,
  },
  {
    path: 'cerrar-sesion',
    component:CerrarSesionComponent,
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
