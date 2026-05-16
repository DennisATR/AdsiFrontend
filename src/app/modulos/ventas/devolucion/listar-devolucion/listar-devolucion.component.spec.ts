import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarDevolucionComponent } from './listar-devolucion.component';

describe('ListarDevolucionComponent', () => {
  let component: ListarDevolucionComponent;
  let fixture: ComponentFixture<ListarDevolucionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarDevolucionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarDevolucionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
