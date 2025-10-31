import { Component, OnInit } from '@angular/core';
import { ConfiguracionRutasBackend } from '../../../../config/configuracion.rutas.backend';
import { VendedorService } from '../../../../servicios/parametros/vendedor.service';
import { Router, ActivatedRoute } from '@angular/router';
import { VendedorModel } from '../../../../modelos/vendedor.model';

@Component({
  selector: 'app-eliminar-vendedor',
  templateUrl: './eliminar-vendedor.component.html',
  styleUrl: './eliminar-vendedor.component.css'
})
export class EliminarVendedorComponent implements OnInit {
  BASE_URL: String = ConfiguracionRutasBackend.urlBackend;
  recordId: string = '';
  nombre: string = "";
  apellido: string = "";
  correo: string = "";
  telefono: string = "";

  constructor(
    private servicio: VendedorService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.recordId = this.route.snapshot.params["id"];
  }

  ngOnInit(): void {
    this.BuscarRegistro();
  }

  BuscarRegistro() {
    this.servicio.BuscarVendedor(this.recordId).subscribe({
      next: (datos: VendedorModel) => {
        this.nombre = datos.Nombre!;
        this.apellido = datos.Apellido!;
        this.correo = datos.Correo!;
        this.telefono = datos.Telefono!;
      },
      error: (err) => {
        alert("El registro no existe.");
        this.router.navigate(['/parametros/vendedor/crear-vendedor']);
      }
    });
  }

  EliminarRegistro() {
    this.servicio.EliminarVendedor(this.recordId).subscribe({
      next: (data: any) => {
        alert("Información eliminada correctamente");
        this.router.navigate(['/parametros/vendedor/crear-vendedor']);
      },
      error: (err: any) => {
        alert("Ha ocurrido un error al eliminar el vendedor");
        console.error('Error:', err);
      }
    });
  }
}