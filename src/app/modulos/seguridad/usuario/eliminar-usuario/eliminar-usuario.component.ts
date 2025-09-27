import { Component } from '@angular/core';
import { ConfiguracionRutasBackend } from '../../../../config/configuracion.rutas.backend';
import { SeguridadService } from '../../../../servicios/seguridad.service';
import { Router, ActivatedRoute } from '@angular/router';
import { UsuarioModel } from '../../../../modelos/usuario.model';

@Component({
  selector: 'app-eliminar-usuario',
  templateUrl: './eliminar-usuario.component.html',
  styleUrl: './eliminar-usuario.component.css'
})
export class EliminarUsuarioComponent {
    BASE_URL: String = ConfiguracionRutasBackend.urlBackend;
    recordId: number = 0;
    nombre: string = "";
    apellido: string = "";
    correo: string = "";
    telefono: string = ""
    rolId: number = 0;
    rolesDisponibles = [
      { id: 1, nombre: 'Administrador' },
      { id: 2, nombre: 'Vendedor' },
      { id: 3, nombre: 'Bodeguero' }
    ];
    constructor(
      private servicio: SeguridadService,
      private router: Router,
      private route: ActivatedRoute
    ) {
      this.recordId = this.route.snapshot.params["id"];
    }
  
    ngOnInit(): void {
      this.BuscarRegistro();
    }

    getRolNombre(rolId: number): string {
      const rol = this.rolesDisponibles.find(r => r.id === rolId);
      return rol ? rol.nombre : 'Rol no encontrado';
    }

    BuscarRegistro() {
      this.servicio.BuscarUsuario(this.recordId).subscribe({
        next: (datos: UsuarioModel) => {
          this.recordId = datos.id!;
          this.nombre = datos.Nombre!;
          this.apellido = datos.Apellido!
          this.correo = datos.Correo!;
          this.telefono = datos.Telefono!;
          this.rolId = datos.rolId!;
        },
        error: (err) => {
          alert("El registro no existe.")
        }
      });
    }
  
    EliminarRegistro() {
      this.servicio.EliminarUsuario(this.recordId).subscribe({
        next: (data: any) => {
          alert("Información eliminada correctamente");
          this.router.navigate(['/seguridad/usuario/crear-usuario']);
        },
        error: (err: any) => {
          alert("Ha ocurrido un error");
        }
      });
    }
  
}

