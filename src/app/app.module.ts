import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { EncabezadoComponent } from './public/pagina-maestra/encabezado/encabezado.component';
import { InicioComponent } from './public/inicio/inicio.component';
import { RutaNoEncontradaComponent } from './public/errores/ruta-no-encontrada/ruta-no-encontrada.component';
import { MenuLateralComponent } from './public/pagina-maestra/menu-lateral/menu-lateral.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AlertDialogComponent } from './shared/dialog/alert-dialog.component';
import { NotificacionDropdownComponent } from './public/pagina-maestra/notificacion-dropdown/notificacion-dropdown.component';


import { SharedDirectivesModule } from './shared/shared-directives.module';


@NgModule({
  declarations: [
    AppComponent,
    EncabezadoComponent,
    InicioComponent,
    RutaNoEncontradaComponent,
    MenuLateralComponent,
    AlertDialogComponent,
    NotificacionDropdownComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    CommonModule,
    SharedDirectivesModule
  ],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }