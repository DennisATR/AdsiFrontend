import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearDevolucionComponent } from './crear-devolucion.component';

describe('CrearDevolucionComponent', () => {
  let component: CrearDevolucionComponent;
  let fixture: ComponentFixture<CrearDevolucionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearDevolucionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearDevolucionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
