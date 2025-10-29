import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EliminarEntregaComponent } from './eliminar-entrega.component';

describe('EliminarEntregaComponent', () => {
  let component: EliminarEntregaComponent;
  let fixture: ComponentFixture<EliminarEntregaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EliminarEntregaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EliminarEntregaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
