import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EliminarZapatoComponent } from './eliminar-zapato.component';

describe('EliminarZapatoComponent', () => {
  let component: EliminarZapatoComponent;
  let fixture: ComponentFixture<EliminarZapatoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EliminarZapatoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EliminarZapatoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
