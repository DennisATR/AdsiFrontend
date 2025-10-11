import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EliminarGastoComponent } from './eliminar-gasto.component';

describe('EliminarGastoComponent', () => {
  let component: EliminarGastoComponent;
  let fixture: ComponentFixture<EliminarGastoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EliminarGastoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EliminarGastoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
