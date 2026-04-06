import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminShowUser } from './admin-show-user';

describe('AdminShowUser', () => {
  let component: AdminShowUser;
  let fixture: ComponentFixture<AdminShowUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminShowUser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminShowUser);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
