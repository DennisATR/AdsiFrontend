import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TirillaComponent } from './tirilla.component';

describe('TirillaComponent', () => {
  let component: TirillaComponent;
  let fixture: ComponentFixture<TirillaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TirillaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TirillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
