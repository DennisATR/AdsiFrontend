import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EliminarCreditoComponent } from './eliminar-credito.component';

describe('EliminarCreditoComponent', () => {
  let component: EliminarCreditoComponent;
  let fixture: ComponentFixture<EliminarCreditoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EliminarCreditoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EliminarCreditoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
