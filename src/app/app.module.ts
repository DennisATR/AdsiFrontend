import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { EncabezadoComponent } from './public/pagina-maestra/encabezado/encabezado.component';
import { InicioComponent } from './public/inicio/inicio.component';
import { RutaNoEncontradaComponent } from './public/errores/ruta-no-encontrada/ruta-no-encontrada.component';
import { MenuLateralComponent } from './public/pagina-maestra/menu-lateral/menu-lateral.component';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [
    AppComponent,
    EncabezadoComponent,
    InicioComponent,
    RutaNoEncontradaComponent,
    MenuLateralComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }