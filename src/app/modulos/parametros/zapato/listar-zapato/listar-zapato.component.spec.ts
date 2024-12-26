import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarZapatoComponent } from './listar-zapato.component';

describe('ListarZapatoComponent', () => {
  let component: ListarZapatoComponent;
  let fixture: ComponentFixture<ListarZapatoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarZapatoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarZapatoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
