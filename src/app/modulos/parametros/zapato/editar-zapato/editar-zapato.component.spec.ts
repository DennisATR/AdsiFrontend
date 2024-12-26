import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarZapatoComponent } from './editar-zapato.component';

describe('EditarZapatoComponent', () => {
  let component: EditarZapatoComponent;
  let fixture: ComponentFixture<EditarZapatoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarZapatoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarZapatoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
