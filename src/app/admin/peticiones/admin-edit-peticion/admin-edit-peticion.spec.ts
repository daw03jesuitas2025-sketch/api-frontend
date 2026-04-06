import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEditPeticion } from './admin-edit-peticion';

describe('AdminEditPeticion', () => {
  let component: AdminEditPeticion;
  let fixture: ComponentFixture<AdminEditPeticion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEditPeticion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEditPeticion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
