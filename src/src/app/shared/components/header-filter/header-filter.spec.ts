import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderFilter } from './header-filter';

describe('HeaderFilter', () => {
  let component: HeaderFilter;
  let fixture: ComponentFixture<HeaderFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderFilter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderFilter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
