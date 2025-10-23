import { Directive, ElementRef, HostListener, Input, Optional } from '@angular/core';
import { FormGroup, NgControl, AbstractControl } from '@angular/forms';
import { MultiSelectDirective } from './multi-select.directive';

@Directive({
  selector: '[appFormNavigation]'
})
export class FormNavigationDirective {
  @Input() formGroup!: FormGroup;
  @Input() nextField?: HTMLElement | ElementRef | MultiSelectDirective;
  @Input() isLastField: boolean = false;
  @Input() onSubmit?: () => void;

  private isProcessing = false; // Prevenir ejecuciones múltiples

  constructor(
    private el: ElementRef,
    @Optional() private ngControl: NgControl
  ) {}

  @HostListener('keydown.enter', ['$event'])
  onEnter(event: Event): void {
    // Prevenir ejecuciones múltiples
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    // Prevenir comportamiento por defecto PERO permitir que otras directivas lo manejen
    event.preventDefault();
    
    // Obtener el control actual
    const control = this.getControl();
    if (!control) {
      this.isProcessing = false;
      return;
    }

    // CRÍTICO: Solo validar el campo ACTUAL, nunca tocar otros campos
    if (control.invalid) {
      // Solo marcar ESTE campo como touched
      control.markAsTouched();
      this.el.nativeElement.focus();
      this.isProcessing = false;
      return;
    }

    // Campo válido: continuar sin tocar NADA más
    this.el.nativeElement.blur();

    // Si es el último campo, manejar submit
    if (this.isLastField) {
      setTimeout(() => {
        this.handleLastField();
        this.isProcessing = false;
      }, 50);
      return;
    }

    // Si hay siguiente campo, enfocarlo
    if (this.nextField) {
      setTimeout(() => {
        this.focusNext();
        this.isProcessing = false;
      }, 50);
    } else {
      this.isProcessing = false;
    }
  }

  private getControl(): AbstractControl | null {
    // Prioridad 1: NgControl inyectado (más confiable)
    if (this.ngControl?.control) {
      return this.ngControl.control;
    }

    if (!this.formGroup) {
      return null;
    }

    // Prioridad 2: Por atributo formControlName
    const controlName = this.el.nativeElement.getAttribute('formControlName');
    if (controlName) {
      return this.formGroup.get(controlName);
    }

    // Prioridad 3: Por ID del elemento
    const elementId = this.el.nativeElement.id;
    if (elementId) {
      return this.formGroup.get(elementId);
    }

    return null;
  }

  private focusNext(): void {
    if (!this.nextField) return;

    try {
      if (this.nextField instanceof MultiSelectDirective) {
        this.nextField.focus();
      } else if (this.nextField instanceof ElementRef) {
        this.nextField.nativeElement.focus();
      } else if (this.nextField instanceof HTMLElement) {
        this.nextField.focus();
      }
    } catch (error) {
      console.error('Error al enfocar siguiente campo:', error);
    }
  }

  private handleLastField(): void {
    if (!this.formGroup) {
      return;
    }

    // Si el formulario es válido, ejecutar submit
    if (this.formGroup.valid) {
      if (this.onSubmit) {
        this.onSubmit();
      }
      return;
    }

    // Si el formulario es inválido, buscar el primer campo inválido
    // IMPORTANTE: Solo marcar el PRIMER campo inválido como touched
    this.focusFirstInvalidField();
  }

  private focusFirstInvalidField(): void {
    if (!this.formGroup) return;

    const controls = this.formGroup.controls;
    
    // Recorrer controles en orden
    for (const fieldName in controls) {
      const control = controls[fieldName];
      
      // Solo procesar el PRIMER campo inválido encontrado
      if (control && control.invalid && !control.touched) {
        // Marcar SOLO este campo como touched
        control.markAsTouched();
        
        // Buscar el elemento en el DOM y enfocarlo
        const fieldElement = this.findFieldElement(fieldName);
        if (fieldElement) {
          fieldElement.focus();
        }
        
        // CRÍTICO: Salir inmediatamente después del primero
        break;
      }
    }
  }

  private findFieldElement(fieldName: string): HTMLElement | null {
    // Buscar por formControlName (más confiable)
    let element = document.querySelector(`[formControlName="${fieldName}"]`);
    if (element) return element as HTMLElement;

    // Buscar por ID
    element = document.getElementById(fieldName);
    if (element) return element as HTMLElement;

    // Buscar por name
    element = document.querySelector(`[name="${fieldName}"]`);
    if (element) return element as HTMLElement;

    return null;
  }
}