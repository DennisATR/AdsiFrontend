import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeguridadRoutingModule } from './seguridad-routing.module';
import { IdentificacionUsuarioComponent } from './identificacion-usuario/identificacion-usuario.component';
import { RecuperarClaveComponent } from './recuperar-clave/recuperar-clave.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CrearUsuarioComponent } from './usuario/crear-usuario/crear-usuario.component';
import { CambioClaveComponent } from './cambio-clave/cambio-clave.component';
import { ListarUsuarioComponent } from './usuario/listar-usuario/listar-usuario.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { EditarUsuarioComponent } from './usuario/editar-usuario/editar-usuario.component';
import { EliminarUsuarioComponent } from './usuario/eliminar-usuario/eliminar-usuario.component';
import { SharedDirectivesModule } from '../../shared/shared-directives.module';


@NgModule({
  declarations: [
    IdentificacionUsuarioComponent,
    RecuperarClaveComponent,
    CrearUsuarioComponent,
    ListarUsuarioComponent,
    CambioClaveComponent,
    EliminarUsuarioComponent,
    EditarUsuarioComponent
  ],
  imports: [
    CommonModule,
    SeguridadRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
    SharedDirectivesModule
  ]
})
export class SeguridadModule { }
