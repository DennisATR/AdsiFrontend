import { Component, ViewChild, OnInit } from '@angular/core';
import { ListarGastoComponent } from '../listar-gasto/listar-gasto.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GastoService } from '../../../../servicios/parametros/gasto.service';
import { GastoModel } from '../../../../modelos/gasto.model';

@Component({
  selector: 'app-crear-gasto',
  templateUrl: './crear-gasto.component.html',
  styleUrl: './crear-gasto.component.css'
})
export class CrearGastoComponent implements OnInit {
  @ViewChild(ListarGastoComponent) listarGastoComponent!: ListarGastoComponent;
  fGroup: FormGroup = new FormGroup({});

  // Propiedades para el selector de conceptos inteligente
  ConceptoSearchQuery: string = '';
  conceptosFiltrados: string[] = [];
  showConceptoDropdown: boolean = false;
  selectedConceptoIndex: number = -1;
  conceptosComunes: string[] = [
    'Arriendo', 'Servicio de Luz', 'Servicio de Agua', 'Pan del Dia', 'Internet',
    'Papel Higiénico', 'Artículos de Limpieza', 'Retiro de Caja', 'Otros'
  ];

  constructor(
    private fb: FormBuilder,
    private servicioGasto: GastoService
  ) {}

  ngOnInit() {
    this.ConstruirFormulario();
    this.conceptosFiltrados = [...this.conceptosComunes];
    this.establecerFechaActual();
  }

  get ObtenerFormGroup() {
    return this.fGroup.controls;
  }

  ConstruirFormulario() {
    this.fGroup = this.fb.group({
      Concepto: ['', [Validators.required]],
      Descripcion: [''], 
      Valor: ['', [Validators.required, Validators.min(0)]],
      Fecha: ['', [Validators.required]]
    });
  }

  establecerFechaActual(): void {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    const fechaFormateada = `${año}-${mes}-${dia}`;
    this.fGroup.get('Fecha')?.setValue(fechaFormateada);
  }

  RegistrarGasto() {
    let campos = this.ObtenerFormGroup;
    let datos = {
      Concepto: campos['Concepto'].value,
      Descripcion: campos['Descripcion'].value,
      Valor: parseFloat(campos['Valor'].value),
      Fecha: new Date(campos['Fecha'].value).toISOString()
    };
    
    console.log("Datos del gasto a registrar:", datos);

    this.servicioGasto.RegistrarGasto(datos).subscribe({
      next: (respuesta: GastoModel) => {
        alert('Gasto registrado correctamente');
        this.limpiarFormulario();
        if (this.listarGastoComponent) {
          this.listarGastoComponent.obtenerGastos();
        }
      },
      error: (err) => {
        alert('Error al registrar el gasto');
        console.error('Error:', err);
      }
    });
  }

  // Métodos para el selector de conceptos inteligente
  onConceptoSearchInput(): void {
    const query = this.ConceptoSearchQuery.toLowerCase().trim();
    
    if (!query) {
      this.conceptosFiltrados = [...this.conceptosComunes];
    } else {
      this.conceptosFiltrados = this.conceptosComunes.filter(concepto => 
        concepto.toLowerCase().includes(query)
      );
    }
    
    this.showConceptoDropdown = true;
    this.selectedConceptoIndex = -1;
    
    // Solo establecer el valor si existe en la lista
    const existeEnLista = this.conceptosComunes.some(
      concepto => concepto.toLowerCase() === query
    );
    if (existeEnLista) {
      this.fGroup.get('Concepto')?.setValue(this.ConceptoSearchQuery);
    } else {
      this.fGroup.get('Concepto')?.setValue('');
    }
  }

  onConceptoKeydown(event: KeyboardEvent, nextField?: HTMLElement): void {
    if (!this.showConceptoDropdown) {
      if (event.key === 'Enter') {
        event.preventDefault();
        // Solo permitir avanzar si hay un concepto válido seleccionado
        const conceptoValido = this.conceptosComunes.some(
          concepto => concepto.toLowerCase() === this.ConceptoSearchQuery.toLowerCase().trim()
        );
        if (conceptoValido) {
          this.fGroup.get('Concepto')?.setValue(this.ConceptoSearchQuery.trim());
          this.fGroup.get('Concepto')?.markAsTouched();
          if (nextField) {
            nextField.focus();
          }
        } else {
          this.fGroup.get('Concepto')?.markAsTouched();
        }
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedConceptoIndex = Math.min(
          this.selectedConceptoIndex + 1,
          this.conceptosFiltrados.length - 1
        );
        this.scrollToSelectedConceptoOption();
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        this.selectedConceptoIndex = Math.max(this.selectedConceptoIndex - 1, 0);
        this.scrollToSelectedConceptoOption();
        break;
        
      case 'Enter':
        event.preventDefault();
        if (this.selectedConceptoIndex >= 0 && this.selectedConceptoIndex < this.conceptosFiltrados.length) {
          this.seleccionarConcepto(this.conceptosFiltrados[this.selectedConceptoIndex]);
          if (nextField) {
            nextField.focus();
          }
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        this.showConceptoDropdown = false;
        this.selectedConceptoIndex = -1;
        break;
        
      case 'Tab':
        // Solo permitir tab si hay un concepto válido
        const conceptoValido = this.conceptosComunes.some(
          concepto => concepto.toLowerCase() === this.ConceptoSearchQuery.toLowerCase().trim()
        );
        if (conceptoValido) {
          this.fGroup.get('Concepto')?.setValue(this.ConceptoSearchQuery.trim());
        }
        this.showConceptoDropdown = false;
        this.selectedConceptoIndex = -1;
        break;
    }
  }

  scrollToSelectedConceptoOption(): void {
    if (this.selectedConceptoIndex >= 0) {
      setTimeout(() => {
        const dropdown = document.querySelector('.search-select-dropdown');
        const selectedOption = dropdown?.querySelector(`.search-select-option:nth-child(${this.selectedConceptoIndex + 1})`);
        
        if (dropdown && selectedOption) {
          const dropdownRect = dropdown.getBoundingClientRect();
          const optionRect = selectedOption.getBoundingClientRect();
          
          if (optionRect.bottom > dropdownRect.bottom) {
            dropdown.scrollTop += optionRect.bottom - dropdownRect.bottom;
          } else if (optionRect.top < dropdownRect.top) {
            dropdown.scrollTop -= dropdownRect.top - optionRect.top;
          }
        }
      });
    }
  }

  onConceptoFocus(): void {
    this.showConceptoDropdown = true;
    this.conceptosFiltrados = [...this.conceptosComunes];
    this.selectedConceptoIndex = -1;
  }

  onConceptoBlur(): void {
    setTimeout(() => {
      this.showConceptoDropdown = false;
      this.selectedConceptoIndex = -1;
      
      // Validar que el concepto escrito existe en la lista
      const conceptoValido = this.conceptosComunes.some(
        concepto => concepto.toLowerCase() === this.ConceptoSearchQuery.toLowerCase().trim()
      );
      
      if (!conceptoValido) {
        this.ConceptoSearchQuery = '';
        this.fGroup.get('Concepto')?.setValue('');
      }
    }, 200);
  }

  seleccionarConcepto(concepto: string): void {
    this.ConceptoSearchQuery = concepto;
    this.fGroup.get('Concepto')?.setValue(concepto);
    this.showConceptoDropdown = false;
    this.selectedConceptoIndex = -1;
  }

  onConceptoOptionHover(index: number): void {
    this.selectedConceptoIndex = index;
  }

  limpiarConceptoSeleccionado(): void {
    this.ConceptoSearchQuery = '';
    this.fGroup.get('Concepto')?.setValue('');
    this.conceptosFiltrados = [...this.conceptosComunes];
    this.selectedConceptoIndex = -1;
  }

  limpiarFormulario(): void {
    this.fGroup.reset();
    this.limpiarConceptoSeleccionado();
    this.establecerFechaActual();
  }

  focusNext(currentField: HTMLElement, nextField?: HTMLElement) {
    const fieldName = currentField.id || currentField.getAttribute('formControlName') || '';
    
    if (this.fGroup.get(fieldName)?.valid) {
      currentField.blur();
      if (nextField) {
        nextField.focus();
      }
    } else {
      currentField.focus();
      this.fGroup.get(fieldName)?.markAsTouched();
    }
  }

  submitOrFocusNext(currentField: HTMLElement) {
    currentField.blur();
    if (this.fGroup.valid) {
      this.RegistrarGasto();
    } else {
      for (const controlName in this.fGroup.controls) {
        const control = this.fGroup.get(controlName);
        if (control && control.invalid) {
          const invalidField = document.getElementById(controlName);
          if (invalidField) {
            invalidField.focus();
          }
          break;
        }
      }
    }
  }
}