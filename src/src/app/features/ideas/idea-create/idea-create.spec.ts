import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdeaCreate } from './idea-create';

describe('IdeaCreate', () => {
  let component: IdeaCreate;
  let fixture: ComponentFixture<IdeaCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdeaCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdeaCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
