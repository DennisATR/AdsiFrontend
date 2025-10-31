import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EliminarVendedorComponent } from './eliminar-vendedor.component';

describe('EliminarVendedorComponent', () => {
  let component: EliminarVendedorComponent;
  let fixture: ComponentFixture<EliminarVendedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EliminarVendedorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EliminarVendedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
