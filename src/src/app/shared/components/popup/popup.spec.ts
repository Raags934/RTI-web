import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IdeaEventsService } from '../../../events/ideaServiceEvents';
import { PopUp } from './popup';

fdescribe('Popup', () => {
  let component: PopUp;
  let fixture: ComponentFixture<PopUp>;
  let ideaEventSpy:jasmine.SpyObj<IdeaEventsService>
 

  beforeEach(async () => {
    ideaEventSpy=jasmine.createSpyObj('IdeaEventsService',['closePopUp']);
    await TestBed.configureTestingModule({
      imports: [PopUp],
      providers:[
      {provide:IdeaEventsService,useValue: ideaEventSpy}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopUp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should call closePopUp when backdrop is clicked',()=>{
    const fakeEvent={
       target:{
        classList:{
          contains:()=>true
        }
       }
    }as any;
    component.onBackdrop(fakeEvent);
  expect(ideaEventSpy.closePopUp).toHaveBeenCalled();
  });
  it('should not call closePopUp when non-backdrop is clicked',()=>{
    const fakeEvent={
       target:{
        classList:{
          contains:()=>false
        }
       }
    }as any;
    component.onBackdrop(fakeEvent);
  expect(ideaEventSpy.closePopUp).not.toHaveBeenCalled();
  });
 
});
