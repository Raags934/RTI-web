import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactForHelp } from './contact-for-help';

describe('ContactForHelp', () => {
  let component: ContactForHelp;
  let fixture: ComponentFixture<ContactForHelp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactForHelp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactForHelp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
