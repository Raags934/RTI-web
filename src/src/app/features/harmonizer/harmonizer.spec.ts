import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Harmonizer } from './harmonizer';

describe('Harmonizer', () => {
  let component: Harmonizer;
  let fixture: ComponentFixture<Harmonizer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Harmonizer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Harmonizer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
