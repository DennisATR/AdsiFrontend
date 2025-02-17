import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ParametrosService } from '../../../../servicios/parametros.service';
import { ZapatoModel } from '../../../../modelos/zapato.model';

@Component({
  selector: 'app-crear-zapato',
  templateUrl: './crear-zapato.component.html',
  styleUrl: './crear-zapato.component.css'
})
export class CrearZapatoComponent {
  fGroup: FormGroup = new FormGroup({});
  zapatos: ZapatoModel[] = [];
  zapatosFiltrados: ZapatoModel[] = [];
  searchQuery: string = '';


  constructor(
    private fb: FormBuilder,
    private servicioParametros: ParametrosService
  ) {
  }

  codigoBarraHabilitado: boolean = false;

  ngOnInit() {
    this.ConstruirFormulario();
    this.obtenerZapatos();
    this.fGroup.get('CodigoBarra')?.disable(); // Deshabilitar inicialmente
  }

  get ObtenerFormGroup(){
    return this.fGroup.controls;
  }

  /**
   * Construcción del formulario con los controles
   */
  ConstruirFormulario() {
    this.fGroup = this.fb.group({
      CodigoBarra: ['', Validators.required],
      Descripcion: ['', Validators.required],
      Categoria: ['', Validators.required],
      Talla: ['', Validators.required],
      Color: ['', Validators.required],
      Ganancia: ['', Validators.required],
      PrecioCosto: ['', Validators.required],
      PrecioVentaMax: ['', Validators.required],
      PrecioVentaMin: ['', Validators.required],
      Cantidad: ['', Validators.required],
      Fecha: ['', Validators.required],
      proveedorId: ['', Validators.required],
    });
  }

  RegistrarZapato() {
    let campos = this.ObtenerFormGroup;
    let datos = {
      id: campos["CodigoBarra"].value,
      Descripcion: campos["Descripcion"].value,
      Categoria: campos["Categoria"].value,
      Talla: campos["Talla"].value,
      Color: campos["Color"].value,
      Ganancia: 0,
      PrecioCosto: campos["PrecioCosto"].value,
      PrecioVentaMax: campos["PrecioVentaMax"].value,
      PrecioVentaMin: campos["PrecioVentaMin"].value,
      Cantidad: campos["Cantidad"].value,
      Fecha: new Date().toISOString(),
      proveedorId: campos["proveedorId"].value,
    };
    console.log(datos);
    this.servicioParametros.RegistrarZapato(datos).subscribe({
      next: (respuesta: ZapatoModel) => {
        alert("Zapato registrado correctamente");
        this.obtenerZapatos();
      },
      error: (err) => {
        alert("Error al registrar el zapato");
      }
    });
  }

  obtenerZapatos() {
    this.servicioParametros.ObtenerZapatos().subscribe({
      next: (respuesta: ZapatoModel[]) => {
        this.zapatos = respuesta;
        this.zapatosFiltrados = [...this.zapatos]; // Inicializa los usuarios filtrados con todos los usuarios
      
      },
      error: (err) => {
        alert("Error al obtener los zapatos");
      }
    });
  }

  habilitarCodigoBarra(event: Event) {
    this.codigoBarraHabilitado = (event.target as HTMLInputElement).checked;
  
    if (this.codigoBarraHabilitado) {
      this.fGroup.get('CodigoBarra')?.enable();
    } else {
      this.fGroup.get('CodigoBarra')?.disable();
    }
  }

  filtrarZapato(): void {
    const query = this.searchQuery.toLowerCase();
    if (!query) {
      // Si no hay texto en el campo de búsqueda, mostrar todos los usuarios
      this.zapatosFiltrados = [...this.zapatos];
    } else {
        this.zapatosFiltrados = this.zapatos.filter(zapato => 
        (zapato.id?.toLowerCase().includes(query) || '') ||
        (zapato.Descripcion?.toLowerCase().includes(query) || '') ||
        (zapato.Categoria?.toLowerCase().includes(query) || '') ||
        String(zapato.proveedorId).includes(query)
        );
    }
  }
  

  focusNext(currentField: HTMLElement, nextField?: HTMLElement) {
    // Verificamos si el campo actual es válido antes de mover el foco
    if (this.fGroup.get(currentField.id)?.valid) {
      currentField.blur(); // Quita el foco actual
      if (nextField) {
        nextField.focus(); // Mueve el foco al siguiente campo
      }
    } else {
      // Si el campo no es válido, mantenemos el foco en el campo actual
      currentField.focus();
      this.fGroup.get(currentField.id)?.markAsTouched();
    }
  }
  
  submitOrFocusNext(currentField: HTMLElement) {
    currentField.blur();
    if (this.fGroup.valid) {
      this.RegistrarZapato();
    } else {
      // Si el formulario no es válido, mantener el foco en el campo que tiene el error
      for (const controlName in this.fGroup.controls) {
        const control = this.fGroup.get(controlName);
        if (control && control.invalid) {
          const invalidField = document.getElementById(controlName);
          if (invalidField) {
            invalidField.focus();
          }
          break; // Solo nos movemos al primer campo inválido
        }
      }
    }
  }
}
