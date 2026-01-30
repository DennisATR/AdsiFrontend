import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineaVentaComponent } from './linea-venta.component';

describe('LineaVentaComponent', () => {
  let component: LineaVentaComponent;
  let fixture: ComponentFixture<LineaVentaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineaVentaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LineaVentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
