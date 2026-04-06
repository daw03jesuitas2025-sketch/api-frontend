import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEditUser } from './admin-edit-user';

describe('AdminEditUser', () => {
  let component: AdminEditUser;
  let fixture: ComponentFixture<AdminEditUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEditUser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEditUser);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
