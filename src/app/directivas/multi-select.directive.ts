import { Directive, ElementRef, HostListener, Input, Output, EventEmitter, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appMultiSelect]',
  exportAs: 'appMultiSelect' // ← AGREGAR ESTO
})
export class MultiSelectDirective implements OnInit, OnDestroy {
  @Input() opciones: string[] = [];
  @Input() placeholder: string = 'Selecciona opciones...';
  @Output() opcionesSeleccionadas = new EventEmitter<string[]>();
  @Output() enterPresionado = new EventEmitter<void>(); // ← NUEVO OUTPUT

  private el: HTMLInputElement;
  private container: HTMLElement | null = null;
  private chipsContainer: HTMLElement | null = null;
  private searchInput: HTMLInputElement | null = null;
  private dropdown: HTMLElement | null = null;
  private opcionesFiltradas: string[] = [];
  private valoresSeleccionados: string[] = [];
  private selectedIndex: number = -1;
  private showDropdown: boolean = false;
  private isSelectingWithMouse: boolean = false;

  constructor(
    private elementRef: ElementRef,
    private control: NgControl,
    private renderer: Renderer2
  ) {
    this.el = this.elementRef.nativeElement;
  }

  ngOnInit() {
    this.opcionesFiltradas = [...this.opciones];
    this.crearEstructura();
    this.setupValueChanges();
    this.setupEventListeners();
  }

  ngOnDestroy() {
    if (this.container && this.container.parentElement) {
      this.container.parentElement.removeChild(this.container);
    }
  }

  // Método público para hacer focus desde fuera
  public focus(): void {
    if (this.searchInput) {
      this.searchInput.focus();
    }
  }

  private crearEstructura(): void {
    const parent = this.el.parentElement;
    if (!parent) return;

    this.renderer.setStyle(this.el, 'display', 'none');

    const label = parent.querySelector('label');

    this.chipsContainer = this.renderer.createElement('div');
    this.renderer.addClass(this.chipsContainer, 'multi-chips-input');
    
    const classes = this.el.className.split(' ');
    classes.forEach(cls => {
      if (cls && cls !== 'ng-untouched' && cls !== 'ng-pristine' && cls !== 'ng-valid' && cls !== 'ng-invalid' && cls !== 'ng-touched' && cls !== 'ng-dirty') {
        this.renderer.addClass(this.chipsContainer, cls);
      }
    });

    const inputId = this.el.id;
    if (inputId) {
      this.renderer.setAttribute(this.chipsContainer, 'id', inputId + '-chips');
    }
    
    this.renderer.setStyle(this.chipsContainer, 'display', 'flex');
    this.renderer.setStyle(this.chipsContainer, 'align-items', 'center');
    this.renderer.setStyle(this.chipsContainer, 'flex-wrap', 'nowrap');
    this.renderer.setStyle(this.chipsContainer, 'gap', '4px');
    this.renderer.setStyle(this.chipsContainer, 'height', '45px');
    this.renderer.setStyle(this.chipsContainer, 'padding', '6px 12px');
    this.renderer.setStyle(this.chipsContainer, 'border', '1px solid #d1d5db');
    this.renderer.setStyle(this.chipsContainer, 'border-radius', '8px');
    this.renderer.setStyle(this.chipsContainer, 'background-color', 'white');
    this.renderer.setStyle(this.chipsContainer, 'cursor', 'text');
    this.renderer.setStyle(this.chipsContainer, 'overflow-x', 'auto');
    this.renderer.setStyle(this.chipsContainer, 'overflow-y', 'hidden');
    this.renderer.setStyle(this.chipsContainer, 'width', '100%');
    this.renderer.setStyle(this.chipsContainer, 'box-sizing', 'border-box');
    this.renderer.setStyle(this.chipsContainer, 'transition', 'all 0.2s ease');

    const style = document.createElement('style');
    style.textContent = `
      .multi-chips-input::-webkit-scrollbar {
        height: 4px;
      }
      .multi-chips-input::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 2px;
      }
      .multi-chips-input::-webkit-scrollbar-track {
        background: transparent;
      }
      .multi-chips-input:hover {
        border-color: #9ca3af !important;
      }
      .multi-chips-input:focus-within {
        outline: none;
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        background-color: #fefefe;
      }
    `;
    if (!document.getElementById('multi-chips-styles')) {
      style.id = 'multi-chips-styles';
      document.head.appendChild(style);
    }

    this.searchInput = this.renderer.createElement('input');
    this.renderer.setAttribute(this.searchInput, 'type', 'text');
    this.renderer.setAttribute(this.searchInput, 'autocomplete', 'off');
    this.renderer.setStyle(this.searchInput, 'border', 'none');
    this.renderer.setStyle(this.searchInput, 'outline', 'none');
    this.renderer.setStyle(this.searchInput, 'background', 'transparent');
    this.renderer.setStyle(this.searchInput, 'flex', '1 1 auto');
    this.renderer.setStyle(this.searchInput, 'min-width', '80px');
    this.renderer.setStyle(this.searchInput, 'max-width', '100%');
    this.renderer.setStyle(this.searchInput, 'font-size', '0.875rem');
    this.renderer.setStyle(this.searchInput, 'padding', '0');
    this.renderer.setStyle(this.searchInput, 'margin', '0');
    this.renderer.setStyle(this.searchInput, 'height', '100%');
    this.renderer.setStyle(this.searchInput, 'color', 'inherit');
    this.renderer.setStyle(this.searchInput, 'box-sizing', 'border-box');
    
    this.renderer.setAttribute(this.searchInput, 'placeholder', this.placeholder);

    this.renderer.appendChild(this.chipsContainer, this.searchInput);
    this.renderer.insertBefore(parent, this.chipsContainer, this.el);

    this.container = parent;

    this.dropdown = this.renderer.createElement('div');
    this.renderer.addClass(this.dropdown, 'search-select-dropdown');
    this.renderer.setStyle(this.dropdown, 'display', 'none');
    this.renderer.appendChild(parent, this.dropdown);

    this.renderer.listen(this.chipsContainer, 'click', (e: Event) => {
      e.stopPropagation();
      this.searchInput?.focus();
    });
  }

  private setupValueChanges(): void {
    const initialValue = this.control.control?.value;
    if (initialValue && typeof initialValue === 'string') {
      this.valoresSeleccionados = initialValue.split(',').map(v => v.trim()).filter(v => v);
      this.renderizarChips();
    }

    // Suscribirse a cambios en el FormControl
    this.control.control?.valueChanges.subscribe((value) => {
      // Si el valor es null, undefined o string vacío, limpiar los chips
      if (!value || value === '') {
        this.valoresSeleccionados = [];
        this.renderizarChips();
      } else if (typeof value === 'string') {
        // Si hay un valor nuevo, actualizarlo
        const nuevosValores = value.split(',').map(v => v.trim()).filter(v => v);
        // Solo actualizar si realmente cambió
        if (JSON.stringify(nuevosValores) !== JSON.stringify(this.valoresSeleccionados)) {
          this.valoresSeleccionados = nuevosValores;
          this.renderizarChips();
        }
      }
    });
  }

  private setupEventListeners(): void {
    if (!this.searchInput) return;

    this.renderer.listen(this.searchInput, 'input', (e: Event) => {
      const query = this.searchInput?.value || '';
      this.filtrarOpciones(query);
      this.showDropdown = true;
      this.selectedIndex = -1;
      this.actualizarDropdown();
    });

    this.renderer.listen(this.searchInput, 'focus', () => {
      this.showDropdown = true;
      this.opcionesFiltradas = [...this.opciones];
      this.selectedIndex = -1;
      this.actualizarDropdown();

      const label = this.container?.querySelector('label');
      if (label) {
        this.renderer.addClass(label, 'active');
      }
    });

    this.renderer.listen(this.searchInput, 'blur', () => {
      setTimeout(() => {
        // Si estamos seleccionando con mouse, ignorar el blur
        if (this.isSelectingWithMouse) {
          this.isSelectingWithMouse = false;
          return;
        }

        this.showDropdown = false;
        if (this.searchInput) {
          this.searchInput.value = '';
        }
        this.actualizarDropdown();

        const label = this.container?.querySelector('label');
        if (label && this.valoresSeleccionados.length === 0) {
          this.renderer.removeClass(label, 'active');
        }
      }, 200);
    });

    this.renderer.listen(this.searchInput, 'keydown', (e: KeyboardEvent) => {
      this.onKeyDown(e);
    });
  }

  private renderizarChips(): void {
    if (!this.chipsContainer || !this.searchInput) return;

    const chips = this.chipsContainer.querySelectorAll('.chip');
    chips.forEach(chip => this.renderer.removeChild(this.chipsContainer, chip));

    this.valoresSeleccionados.forEach(valor => {
      const chip = this.crearChip(valor);
      this.renderer.insertBefore(this.chipsContainer, chip, this.searchInput);
    });

    if (this.valoresSeleccionados.length > 0) {
      this.renderer.setAttribute(this.searchInput, 'placeholder', '');
    } else {
      this.renderer.setAttribute(this.searchInput, 'placeholder', this.placeholder);
    }

    const label = this.container?.querySelector('label');
    if (label && this.valoresSeleccionados.length > 0) {
      this.renderer.addClass(label, 'active');
    }

    if (this.chipsContainer) {
      setTimeout(() => {
        this.chipsContainer!.scrollLeft = this.chipsContainer!.scrollWidth;
      }, 0);
    }
  }

  private crearChip(valor: string): HTMLElement {
    const chip = this.renderer.createElement('span');
    this.renderer.addClass(chip, 'chip');
    
    this.renderer.setStyle(chip, 'display', 'inline-flex');
    this.renderer.setStyle(chip, 'align-items', 'center');
    this.renderer.setStyle(chip, 'gap', '4px');
    this.renderer.setStyle(chip, 'padding', '3px 8px');
    this.renderer.setStyle(chip, 'background', '#e0e0e0');
    this.renderer.setStyle(chip, 'color', '#424242');
    this.renderer.setStyle(chip, 'border-radius', '12px');
    this.renderer.setStyle(chip, 'font-size', '12px');
    this.renderer.setStyle(chip, 'white-space', 'nowrap');
    this.renderer.setStyle(chip, 'line-height', '1.2');
    this.renderer.setStyle(chip, 'flex-shrink', '0');
    this.renderer.setStyle(chip, 'max-height', '24px');

    const text = this.renderer.createText(valor);
    this.renderer.appendChild(chip, text);

    const closeBtn = this.renderer.createElement('span');
    const closeText = this.renderer.createText('×');
    this.renderer.appendChild(closeBtn, closeText);
    
    this.renderer.setStyle(closeBtn, 'cursor', 'pointer');
    this.renderer.setStyle(closeBtn, 'font-size', '16px');
    this.renderer.setStyle(closeBtn, 'line-height', '1');
    this.renderer.setStyle(closeBtn, 'margin-left', '2px');
    this.renderer.setStyle(closeBtn, 'opacity', '0.6');
    this.renderer.setStyle(closeBtn, 'transition', 'opacity 0.2s');
    this.renderer.setStyle(closeBtn, 'display', 'flex');
    this.renderer.setStyle(closeBtn, 'align-items', 'center');

    this.renderer.listen(closeBtn, 'mouseenter', () => {
      this.renderer.setStyle(closeBtn, 'opacity', '1');
    });
    
    this.renderer.listen(closeBtn, 'mouseleave', () => {
      this.renderer.setStyle(closeBtn, 'opacity', '0.6');
    });

    this.renderer.listen(closeBtn, 'click', (e: Event) => {
      e.stopPropagation();
      this.removerValor(valor);
    });

    this.renderer.appendChild(chip, closeBtn);
    return chip;
  }

  private removerValor(valor: string): void {
    const index = this.valoresSeleccionados.indexOf(valor);
    if (index > -1) {
      this.valoresSeleccionados.splice(index, 1);
      this.renderizarChips();
      this.actualizarFormControl();
      this.opcionesSeleccionadas.emit([...this.valoresSeleccionados]);
      this.actualizarDropdown();
    }
  }

  private actualizarDropdown(): void {
    if (!this.dropdown) return;

    while (this.dropdown.firstChild) {
      this.renderer.removeChild(this.dropdown, this.dropdown.firstChild);
    }

    if (this.opcionesFiltradas.length === 0) {
      const noResults = this.renderer.createElement('div');
      this.renderer.addClass(noResults, 'no-results');
      const text = this.renderer.createText('No se encontraron resultados');
      this.renderer.appendChild(noResults, text);
      this.renderer.appendChild(this.dropdown, noResults);
    } else {
      this.opcionesFiltradas.forEach((opcion, index) => {
        const optionEl = this.renderer.createElement('div');
        this.renderer.addClass(optionEl, 'search-select-option');
        
        const estaSeleccionado = this.valoresSeleccionados.includes(opcion);
        
        if (estaSeleccionado) {
          this.renderer.addClass(optionEl, 'selected');
        }
        
        if (index === this.selectedIndex) {
          this.renderer.addClass(optionEl, 'keyboard-selected');
        }

        const checkbox = this.renderer.createElement('input');
        this.renderer.setAttribute(checkbox, 'type', 'checkbox');
        this.renderer.setStyle(checkbox, 'margin-right', '8px');
        this.renderer.setProperty(checkbox, 'checked', estaSeleccionado);
        this.renderer.appendChild(optionEl, checkbox);

        const optionName = this.renderer.createElement('span');
        this.renderer.addClass(optionName, 'option-name');
        const text = this.renderer.createText(opcion);
        this.renderer.appendChild(optionName, text);
        this.renderer.appendChild(optionEl, optionName);

        // Selección con mouse/puntero. Usamos pointerdown (mejor cobertura) y
        // fallback a click si pointer events no están disponibles.
        this.renderer.listen(optionEl, 'pointerdown', (e: Event) => {
          this.isSelectingWithMouse = true;
          this.toggleOpcion(opcion);
          // limpiar el flag poco después para evitar bloquear futuros blur
          setTimeout(() => { this.isSelectingWithMouse = false; }, 300);
        });

        this.renderer.listen(optionEl, 'click', (e: Event) => {
          // Si pointerdown ya manejó la selección, ignoramos el click
          if (this.isSelectingWithMouse) return;
          this.toggleOpcion(opcion);
        });

        this.renderer.listen(optionEl, 'mouseenter', () => {
          this.selectedIndex = index;
          this.actualizarDropdown();
        });

        this.renderer.appendChild(this.dropdown, optionEl);
      });
    }

    this.renderer.setStyle(this.dropdown, 'display', this.showDropdown ? 'block' : 'none');
  }

  private filtrarOpciones(query: string): void {
    const queryLower = query.toLowerCase().trim();
    
    if (!queryLower) {
      this.opcionesFiltradas = [...this.opciones];
    } else {
      this.opcionesFiltradas = this.opciones.filter(opcion =>
        opcion.toLowerCase().includes(queryLower)
      );
    }
  }

  private toggleOpcion(opcion: string): void {
    const index = this.valoresSeleccionados.indexOf(opcion);
    
    if (index > -1) {
      this.valoresSeleccionados.splice(index, 1);
    } else {
      this.valoresSeleccionados.push(opcion);
    }
    
    if (this.searchInput) {
      this.searchInput.value = '';
    }
    this.filtrarOpciones('');
    
    this.renderizarChips();
    this.actualizarFormControl();
    this.actualizarDropdown();
    this.opcionesSeleccionadas.emit([...this.valoresSeleccionados]);
    
    this.searchInput?.focus();
  }

  private actualizarFormControl(): void {
    const valorString = this.valoresSeleccionados.join(',');
    this.control.control?.setValue(valorString);
  }

  private scrollToSelected(): void {
    if (this.selectedIndex >= 0 && this.dropdown) {
      setTimeout(() => {
        const options = this.dropdown!.querySelectorAll('.search-select-option');
        const selectedOption = options[this.selectedIndex];
        
        if (selectedOption && this.dropdown) {
          const dropdownRect = this.dropdown.getBoundingClientRect();
          const optionRect = selectedOption.getBoundingClientRect();
          
          if (optionRect.bottom > dropdownRect.bottom) {
            this.dropdown.scrollTop += optionRect.bottom - dropdownRect.bottom;
          } else if (optionRect.top < dropdownRect.top) {
            this.dropdown.scrollTop -= dropdownRect.top - optionRect.top;
          }
        }
      }, 0);
    }
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (!this.searchInput) return;

    if (event.key === 'Backspace' && this.searchInput.value === '' && this.valoresSeleccionados.length > 0) {
      event.preventDefault();
      const ultimoValor = this.valoresSeleccionados[this.valoresSeleccionados.length - 1];
      this.removerValor(ultimoValor);
      return;
    }

    if (!this.showDropdown && event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.showDropdown) {
          this.showDropdown = true;
          this.actualizarDropdown();
        }
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.opcionesFiltradas.length - 1);
        this.actualizarDropdown();
        this.scrollToSelected();
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (!this.showDropdown) {
          this.showDropdown = true;
          this.actualizarDropdown();
        }
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        this.actualizarDropdown();
        this.scrollToSelected();
        break;

      case 'Enter':
        event.preventDefault();
        // Si hay una opción seleccionada, la agregamos
        if (this.selectedIndex >= 0 && this.selectedIndex < this.opcionesFiltradas.length) {
          this.toggleOpcion(this.opcionesFiltradas[this.selectedIndex]);
        }
        // Cerrar dropdown
        this.showDropdown = false;
        if (this.searchInput) {
          this.searchInput.value = '';
        }
        this.actualizarDropdown();
        
        // ← EMITIR EL EVENTO PERSONALIZADO
        this.enterPresionado.emit();
        break;

      case ' ':
        if (this.selectedIndex >= 0 && this.selectedIndex < this.opcionesFiltradas.length) {
          event.preventDefault();
          this.toggleOpcion(this.opcionesFiltradas[this.selectedIndex]);
          this.selectedIndex = 0;
          this.actualizarDropdown();
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.showDropdown = false;
        this.selectedIndex = -1;
        if (this.searchInput) {
          this.searchInput.value = '';
        }
        this.actualizarDropdown();
        break;

      case 'Tab':
        this.showDropdown = false;
        this.selectedIndex = -1;
        if (this.searchInput) {
          this.searchInput.value = '';
        }
        this.actualizarDropdown();
        break;
    }
  }
}