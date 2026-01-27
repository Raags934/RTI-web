import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdeaHistory } from './idea-history';

describe('IdeaHistory', () => {
  let component: IdeaHistory;
  let fixture: ComponentFixture<IdeaHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdeaHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdeaHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
