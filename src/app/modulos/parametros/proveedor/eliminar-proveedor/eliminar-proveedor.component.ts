import { Component } from '@angular/core';
import { ConfiguracionRutasBackend } from '../../../../config/configuracion.rutas.backend';
import { ProveedorModel } from '../../../../modelos/proveedor.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ProveedorService } from '../../../../servicios/parametros/proveedor.service';

@Component({
  selector: 'app-eliminar-proveedor',
  templateUrl: './eliminar-proveedor.component.html',
  styleUrl: './eliminar-proveedor.component.css'
})
export class EliminarProveedorComponent {
  BASE_URL: String = ConfiguracionRutasBackend.urlBackend;
  recordId: number = 0;
  nombre: string = "";
  empresa: string = "";
  ciudad: string = "";
  nit: string = "";
  telefono: string = ""
  constructor(
    private servicio: ProveedorService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.recordId = this.route.snapshot.params["id"];
  }

  ngOnInit(): void {
    this.BuscarRegistro();
  }

  BuscarRegistro() {
    this.servicio.BuscarProveedor(this.recordId).subscribe({
      next: (datos: ProveedorModel) => {
        this.recordId = datos.id!;
        this.nombre = datos.Nombre!;
        this.empresa = datos.Empresa!;
        this.ciudad = datos.Ciudad!;
        this.nit = datos.NIT!;
        this.telefono = datos.Telefono!;
      },
      error: (err) => {
        alert("El registro no existe.")
      }
    });
  }


  EliminarRegistro() {
    this.servicio.EliminarProveedor(this.recordId).subscribe({
      next: (data: any) => {
        alert("Información eliminada correctamente");
        this.router.navigate(['/parametros/proveedor/crear-proveedor']);
      },
      error: (err: any) => {
        alert("Ha ocurrido un error");
      }
    });
  }

}
