import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeguridadRoutingModule } from './seguridad-routing.module';
import { IdentificacionUsuarioComponent } from './identificacion-usuario/identificacion-usuario.component';
import { RecuperarClaveComponent } from './recuperar-clave/recuperar-clave.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CrearUsuarioComponent } from './usuario/crear-usuario/crear-usuario.component';
import { CambioClaveComponent } from './cambio-clave/cambio-clave.component';


@NgModule({
  declarations: [
    IdentificacionUsuarioComponent,
    RecuperarClaveComponent,
    CrearUsuarioComponent,
    CambioClaveComponent
  ],
  imports: [
    CommonModule,
    SeguridadRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class SeguridadModule { }
