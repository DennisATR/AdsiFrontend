import { Component } from '@angular/core';
import { ConfiguracionRutasBackend } from '../../../../config/configuracion.rutas.backend';
import { GastoService } from '../../../../servicios/parametros/gasto.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GastoModel } from '../../../../modelos/gasto.model';

@Component({
  selector: 'app-eliminar-gasto',
  templateUrl: './eliminar-gasto.component.html',
  styleUrl: './eliminar-gasto.component.css'
})
export class EliminarGastoComponent {
  BASE_URL: String = ConfiguracionRutasBackend.urlBackend;
  recordId: number = 0;
  concepto: string = "";
  descripcion: string = "";
  valor: number = 0;
  fecha: string = "";

  constructor(
    private servicio: GastoService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.recordId = this.route.snapshot.params["id"];
  }

  ngOnInit(): void {
    this.BuscarRegistro();
  }

  BuscarRegistro() {
    this.servicio.BuscarGasto(this.recordId).subscribe({
      next: (datos: GastoModel) => {
        this.recordId = datos.id!;
        this.concepto = datos.Concepto!;
        this.descripcion = datos.Descripcion || "N/A";
        this.valor = datos.Valor || 0;
        this.fecha = datos.Fecha ? new Date(datos.Fecha).toISOString().split('T')[0] : 'N/A';
      },
      error: (err) => {
        alert("El registro no existe.")
      }
    });
  }


  EliminarRegistro() {
    this.servicio.EliminarGasto(this.recordId).subscribe({
      next: (data: any) => {
        alert("Información eliminada correctamente");
        this.router.navigate(['/parametros/gasto/crear-gasto']);
      },
      error: (err: any) => {
        alert("Ha ocurrido un error");
      }
    });
  }

}
