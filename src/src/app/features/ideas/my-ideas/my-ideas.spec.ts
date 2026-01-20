import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyIdeas } from './my-ideas';

describe('MyIdeas', () => {
  let component: MyIdeas;
  let fixture: ComponentFixture<MyIdeas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyIdeas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyIdeas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
