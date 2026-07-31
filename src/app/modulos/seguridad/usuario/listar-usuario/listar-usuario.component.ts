import { Component } from '@angular/core';
import { UsuarioModel } from '../../../../modelos/usuario.model';
import { ConfiguracionPaginacion } from '../../../../config/configuracion.paginacion';
import { SeguridadService } from '../../../../servicios/seguridad.service';

import { RolModel } from '../../../../modelos/rol.model';

@Component({
  selector: 'app-listar-usuario',
  templateUrl: './listar-usuario.component.html',
  styleUrl: './listar-usuario.component.css'
})
export class ListarUsuarioComponent {
usuariosFiltrados: UsuarioModel[] = [];
searchQuery: string = '';
pag = 1;
total = 0;
usuarios: UsuarioModel[] = [];
totalItems = 0;

rolesDisponibles: RolModel[] = [];
registrosPorPagina = ConfiguracionPaginacion.registrosPorPagina;
constructor(
  private servicioSeguridad: SeguridadService
){

}

ngOnInit(){
  this.obtenerRoles();
  this.obtenerUsuarios();
}

obtenerRoles(): void {
  this.servicioSeguridad.ObtenerRoles().subscribe({
    next: (respuesta) => {
      this.rolesDisponibles = respuesta;
    },
    error: (err) => {
      console.log(err);
    }
  });
}
  obtenerUsuarios(): void {
    this.servicioSeguridad.obtenerUsuarios().subscribe({
      next: (respuesta) => {
        this.usuarios = respuesta; // Asigna la respuesta al array de usuarios
        this.usuariosFiltrados = [...this.usuarios]; // Inicializa los usuarios filtrados con todos los usuarios
        this.totalItems = this.usuarios.length;
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  /**
   * Filtrar usuarios según el texto ingresado
   */
  filtrarUsuarios(): void {
    const query = this.searchQuery?.toLowerCase().trim() || '';
  
    if (!query) {
      this.usuariosFiltrados = [...this.usuarios];
    } else {
      this.usuariosFiltrados = this.usuarios.filter(usuario => {
        const nombreRol = usuario.rolId !== undefined
          ? this.obtenerNombreRol(usuario.rolId).toLowerCase()
          : '';
        return (usuario.Nombre?.toLowerCase().includes(query)) ||
               (usuario.Apellido?.toLowerCase().includes(query)) ||
               (usuario.Correo?.toLowerCase().includes(query)) ||
               String(usuario.Telefono).includes(query) ||
               String(usuario.rolId).includes(query) ||
               nombreRol.includes(query);
      });
    }
  
    // Actualizar el número total de elementos
    this.totalItems = this.usuariosFiltrados.length;
  
    // Reiniciar la paginación a la primera página si se cambia el filtro
    this.pag = 1;
  }

  /**
   * Obtiene el nombre del rol por su ID para mostrar en la tabla
   */
  obtenerNombreRol(rolId: number): string {
    const rol = this.rolesDisponibles.find(r => r.id === rolId);
    return rol ? rol.Nombre! : `ID: ${rolId}`;
  }
}
