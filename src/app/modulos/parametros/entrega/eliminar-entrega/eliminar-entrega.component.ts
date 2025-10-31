import { Component, OnInit } from '@angular/core';
import { ConfiguracionRutasBackend } from '../../../../config/configuracion.rutas.backend';
import { EntregaService } from '../../../../servicios/parametros/entrega.service';
import { Router, ActivatedRoute } from '@angular/router';
import { EntregaModel } from '../../../../modelos/entrega.model';

@Component({
  selector: 'app-eliminar-entrega',
  templateUrl: './eliminar-entrega.component.html',
  styleUrl: './eliminar-entrega.component.css'
})
export class EliminarEntregaComponent implements OnInit {
  BASE_URL: String = ConfiguracionRutasBackend.urlBackend;
  recordId: number = 0;
  remitente: string = "";
  empresaTrans: string = "";
  numCajas: number = 0;
  cobro: number = 0;
  fecha: string = "";
  observacion: string = "";

  constructor(
    private servicio: EntregaService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.recordId = this.route.snapshot.params["id"];
  }

  ngOnInit(): void {
    this.BuscarRegistro();
  }

  BuscarRegistro() {
    this.servicio.BuscarEntrega(this.recordId).subscribe({
      next: (datos: EntregaModel) => {
        this.remitente = datos.Remitente!;
        this.empresaTrans = datos.EmpresaTrans!;
        this.numCajas = datos.NumCajas!;
        this.cobro = datos.Cobro!;
        this.fecha = datos.Fecha ? new Date(datos.Fecha).toLocaleDateString() : '';
        this.observacion = datos.Observacion || 'Sin observaciones';
      },
      error: (err) => {
        alert("El registro no existe.");
        this.router.navigate(['/parametros/entrega/crear-entrega']);
      }
    });
  }

  EliminarRegistro() {
    this.servicio.EliminarEntrega(this.recordId).subscribe({
      next: (data: any) => {
        alert("Información eliminada correctamente");
        this.router.navigate(['/parametros/entrega/crear-entrega']);
      },
      error: (err: any) => {
        alert("Ha ocurrido un error al eliminar la entrega");
        console.error('Error:', err);
      }
    });
  }
}