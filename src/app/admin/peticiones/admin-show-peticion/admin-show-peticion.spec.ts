import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminShowPeticion } from './admin-show-peticion';

describe('AdminShowPeticion', () => {
  let component: AdminShowPeticion;
  let fixture: ComponentFixture<AdminShowPeticion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminShowPeticion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminShowPeticion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
