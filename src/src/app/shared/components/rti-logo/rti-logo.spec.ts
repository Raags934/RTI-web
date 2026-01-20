import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RTILogo } from './rti-logo';

describe('RTILogo', () => {
  let component: RTILogo;
  let fixture: ComponentFixture<RTILogo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RTILogo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RTILogo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
