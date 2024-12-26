import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearZapatoComponent } from './crear-zapato.component';

describe('CrearZapatoComponent', () => {
  let component: CrearZapatoComponent;
  let fixture: ComponentFixture<CrearZapatoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearZapatoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearZapatoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
