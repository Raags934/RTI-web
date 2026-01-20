import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrioritizationOne } from './prioritization-one';

describe('PrioritizationOne', () => {
  let component: PrioritizationOne;
  let fixture: ComponentFixture<PrioritizationOne>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrioritizationOne]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrioritizationOne);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
