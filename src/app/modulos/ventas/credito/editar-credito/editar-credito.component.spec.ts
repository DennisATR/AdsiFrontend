/// <reference types="jasmine" />

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { EditarCreditoComponent } from './editar-credito.component';
import { PagoFacturaService } from '../../../../servicios/ventas/pago-factura.service';
import { MetodoPagoService } from '../../../../servicios/ventas/metodo-pago.service';

describe('EditarCreditoComponent', () => {
  let component: EditarCreditoComponent;
  let fixture: ComponentFixture<EditarCreditoComponent>;
  let pagoFacturaServiceSpy: jasmine.SpyObj<PagoFacturaService>;
  let metodoPagoServiceSpy: jasmine.SpyObj<MetodoPagoService>;

  beforeEach(async () => {
    pagoFacturaServiceSpy = jasmine.createSpyObj('PagoFacturaService', ['RegistrarPagoFactura']);
    metodoPagoServiceSpy = jasmine.createSpyObj('MetodoPagoService', ['ObtenerMetodosPago']);

    metodoPagoServiceSpy.ObtenerMetodosPago.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [EditarCreditoComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: PagoFacturaService, useValue: pagoFacturaServiceSpy },
        { provide: MetodoPagoService, useValue: metodoPagoServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarCreditoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
