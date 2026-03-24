import { TestBed } from '@angular/core/testing';

import { PagoFacturaService } from './pago-factura.service';

describe('PagoFacturaService', () => {
  let service: PagoFacturaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PagoFacturaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
