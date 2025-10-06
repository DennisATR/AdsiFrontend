import { Component } from '@angular/core';
import { ConfiguracionRutasBackend } from '../../../../config/configuracion.rutas.backend';
import { ClienteService } from '../../../../servicios/parametros/cliente.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ClienteModel } from '../../../../modelos/cliente.model';

@Component({
  selector: 'app-eliminar-cliente',
  templateUrl: './eliminar-cliente.component.html',
  styleUrl: './eliminar-cliente.component.css'
})
export class EliminarClienteComponent {
  BASE_URL: String = ConfiguracionRutasBackend.urlBackend;
  recordId: number = 0;
  nombre: string = "";
  ciudad: string = "";
  identificacion: string = "";
  telefono: string = "";
  correo: string = "";
  fechaNac: string = "";
  constructor(
    private servicio: ClienteService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.recordId = this.route.snapshot.params["id"];
  }

  ngOnInit(): void {
    this.BuscarRegistro();
  }

  BuscarRegistro() {
    this.servicio.BuscarCliente(this.recordId).subscribe({
      next: (datos: ClienteModel) => {
        this.recordId = datos.id!;
        this.nombre = datos.Nombre!;
        this.identificacion = datos.Identificacion || "N/A";
        this.telefono = datos.Telefono || "N/A";
        this.correo = datos.Correo || "N/A";
        this.fechaNac = datos.FechaNac ? new Date(datos.FechaNac).toISOString().split('T')[0] : 'N/A';
      },
      error: (err) => {
        alert("El registro no existe.")
      }
    });
  }


  EliminarRegistro() {
    this.servicio.EliminarCliente(this.recordId).subscribe({
      next: (data: any) => {
        alert("Información eliminada correctamente");
        this.router.navigate(['/parametros/cliente/crear-cliente']);
      },
      error: (err: any) => {
        alert("Ha ocurrido un error");
      }
    });
  }

}
