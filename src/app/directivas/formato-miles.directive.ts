import { Directive, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appFormatoMiles]',
})
export class FormatoMilesDirective implements AfterViewInit {
  private el: HTMLInputElement;

  constructor(
    private elementRef: ElementRef,
    private control: NgControl
  ) {
    this.el = this.elementRef.nativeElement;
  }

  ngAfterViewInit() {
    // Esperar a que el formulario cargue el valor (importante para edición)
    setTimeout(() => {
      const initialValue = this.control.control?.value;
      if (initialValue) {
        const valorFormateado = this.formatear(initialValue.toString());
        this.el.value = valorFormateado;
        this.el.setAttribute('value', valorFormateado);
        this.actualizarValor(valorFormateado);
      }
    }, 150);
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const permitidos = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    
    if (permitidos.includes(event.key) || event.ctrlKey || event.metaKey) {
      return;
    }
    
    if (event.key < '0' || event.key > '9') {
      event.preventDefault();
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const cursorPos = this.el.selectionStart || 0;
    const digitosAntesCursor = this.el.value.substring(0, cursorPos).replace(/\D/g, '').length;
    const soloNumeros = this.el.value.replace(/\D/g, '');
    
    if (!soloNumeros) {
      this.actualizarValor('');
      this.control.control?.setValue(null, { emitEvent: false });
      return;
    }

    const valorFormateado = this.formatear(soloNumeros);
    this.actualizarValor(valorFormateado);
    this.control.control?.setValue(parseFloat(soloNumeros), { emitEvent: false });
    
    // Reposicionar cursor con múltiples intentos para vencer a Materialize
    const nuevaPosicion = this.calcularPosicionCursor(valorFormateado, digitosAntesCursor);
    this.el.setSelectionRange(nuevaPosicion, nuevaPosicion);
    
    requestAnimationFrame(() => {
      this.el.value = valorFormateado;
      this.el.setSelectionRange(nuevaPosicion, nuevaPosicion);
      
      setTimeout(() => {
        this.el.value = valorFormateado;
        this.el.setSelectionRange(nuevaPosicion, nuevaPosicion);
      }, 0);
    });
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const soloNumeros = (event.clipboardData?.getData('text') || '').replace(/\D/g, '');
    
    if (soloNumeros) {
      const valorFormateado = this.formatear(soloNumeros);
      this.actualizarValor(valorFormateado);
      this.control.control?.setValue(parseFloat(soloNumeros), { emitEvent: false });
      setTimeout(() => this.el.setSelectionRange(valorFormateado.length, valorFormateado.length), 0);
    }
  }

  @HostListener('blur')
  onBlur() {
    const valor = this.control.control?.value;
    if (valor) {
      this.actualizarValor(this.formatear(valor.toString()));
    }
  }

  private formatear(valor: string): string {
    const limpio = valor.replace(/\D/g, '');
    if (!limpio) return '';
    
    const numero = parseInt(limpio, 10);
    return isNaN(numero) ? '' : numero.toLocaleString('es-CO');
  }

  private calcularPosicionCursor(textoFormateado: string, digitosAntesCursor: number): number {
    let digitosContados = 0;
    
    for (let i = 0; i < textoFormateado.length; i++) {
      if (textoFormateado[i] !== '.') {
        digitosContados++;
      }
      if (digitosContados === digitosAntesCursor) {
        return i + 1;
      }
    }
    
    return textoFormateado.length;
  }

  private actualizarValor(valor: string): void {
    this.el.value = valor;
    this.el.setAttribute('value', valor);
    
    // Activar label de Materialize si existe
    const label = this.el.nextElementSibling as HTMLElement;
    if (label?.tagName === 'LABEL') {
      valor ? label.classList.add('active') : label.classList.remove('active');
    }
  }
}