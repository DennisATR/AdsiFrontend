import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarCreditoComponent } from './listar-credito.component';

describe('ListarCreditoComponent', () => {
  let component: ListarCreditoComponent;
  let fixture: ComponentFixture<ListarCreditoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarCreditoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarCreditoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
