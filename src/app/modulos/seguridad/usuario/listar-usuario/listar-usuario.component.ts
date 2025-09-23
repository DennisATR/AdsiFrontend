import { Component } from '@angular/core';
import { UsuarioModel } from '../../../../modelos/usuario.model';
import { ConfiguracionPaginacion } from '../../../../config/configuracion.paginacion';
import { ParametrosService } from '../../../../servicios/parametros.service';

@Component({
  selector: 'app-listar-usuario',
  templateUrl: './listar-usuario.component.html',
  styleUrl: './listar-usuario.component.css'
})
export class ListarUsuarioComponent {
listarRegistros: UsuarioModel[] = [];
pag = 1;
total = 0;
registrosPorPagina = ConfiguracionPaginacion.registrosPorPagina;
constructor(
  private servicio: ParametrosService
){

}

ngOnInit(){
}    

}
