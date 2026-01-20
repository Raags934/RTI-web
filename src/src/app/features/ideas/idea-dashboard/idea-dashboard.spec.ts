import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdeaDashboard } from './idea-dashboard';

describe('IdeaDashboard', () => {
  let component: IdeaDashboard;
  let fixture: ComponentFixture<IdeaDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdeaDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdeaDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
