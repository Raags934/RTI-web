import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdeaView } from './idea-view';

fdescribe('IdeaView', () => {
  let component: IdeaView;
  let fixture: ComponentFixture<IdeaView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdeaView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdeaView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
