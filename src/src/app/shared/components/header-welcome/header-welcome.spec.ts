import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderWelcome } from './header-welcome';

describe('HeaderWelcome', () => {
  let component: HeaderWelcome;
  let fixture: ComponentFixture<HeaderWelcome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderWelcome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderWelcome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
