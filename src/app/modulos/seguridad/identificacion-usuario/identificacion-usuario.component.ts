import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormBuilder, Validators } from '@angular/forms';
import { UsuarioModel } from '../../../modelos/usuario.model';
import { SeguridadService } from '../../../servicios/seguridad.service';
import { MD5 } from 'crypto-js';
import { Router } from '@angular/router';
import { UsuarioValidadoModel } from '../../../modelos/usuario.validado.model';

@Component({
  selector: 'app-identificacion-usuario',
  templateUrl: './identificacion-usuario.component.html',
  styleUrls: ['./identificacion-usuario.component.css']
})
export class IdentificacionUsuarioComponent {
  fGroup: FormGroup = new FormGroup({});

  constructor(
    private fb: FormBuilder,
    private servicioSeguridad: SeguridadService,
    private router: Router
  ) {

  }

  ngOnInit() {
    this.ConstruirFormulario();
  }

  ConstruirFormulario() {
    this.fGroup = this.fb.group({
      usuario: ['', [Validators.required, Validators.email]],
      clave: ['', [Validators.required,]]
    });
  }

  IdentificarUsuario() {
  if (this.fGroup.invalid) {
    alert('Datos incompletos');
    return;
  }

  const usuario = this.obtenerFormGroup['usuario'].value;
  const clave = this.obtenerFormGroup['clave'].value;

  this.servicioSeguridad.IdentificarUsuario(usuario, clave).subscribe({
    next: (resp: UsuarioValidadoModel) => {
      if (resp?.user && resp?.token) {
        this.servicioSeguridad.AlmacenarDatosUsuarioIdentificado(resp.user);
        this.servicioSeguridad.AlmacenarDatosUsuarioValidado(resp);
        this.router.navigate(['/inicio']);
      } else {
        alert('Usuario o clave incorrectos');
      }
    },
    error: (err) => {
      console.log(err);
      alert('Usuario o clave incorrectos');
    }
  });
}

  get obtenerFormGroup() {
    return this.fGroup.controls;
  }

}