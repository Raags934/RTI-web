import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Buttons } from './buttons';
import { IdeaEventsService } from '../../../events/ideaServiceEvents';
import { Idea } from '../../../models/idea.model';

fdescribe('Buttons', () => {
  let component: Buttons;
  let fixture: ComponentFixture<Buttons>;
  let ideaEvents:jasmine.SpyObj<IdeaEventsService>;

  beforeEach(async () => {
    const spy=jasmine.createSpyObj('IdeaEventsService',[
      'submitIdea',
      'saveDraft',
      'cancelIdea',
      'closePopUp',
      'confirmPopUp',
      'prevIdea',
      'nextIdea',
      'assessIdea',
      'submitToHarmonization'
    ]);
    await TestBed.configureTestingModule({
      imports: [Buttons],
      providers:[
        {provide: IdeaEventsService,useValue:spy}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Buttons);
    component = fixture.componentInstance;
    ideaEvents=TestBed.inject(IdeaEventsService) as jasmine.SpyObj<IdeaEventsService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  //default inputs
  it('should create component with default values',()=>{
    expect(component).toBeTruthy();
    expect(component.variant).toBe('type1');
    expect(component.color).toBe('primary');
    expect(component.size).toBe('medium');
    expect(component.iconPosition).toBe('left');
    expect(component.isDisabled).toBeFalse();
    expect(component.actionType).toBe('closePopUp');
  });
  it('should call submitIdea when action type is submitIdea',()=>{
    component.actionType='submitIdea';
    component.onClick();
    expect(ideaEvents.submitIdea).toHaveBeenCalled();
  });
  it('should call saveDraft when action type is saveDraft',()=>{
    component.actionType='saveDraft';
    component.onClick();
    expect(ideaEvents.saveDraft).toHaveBeenCalled();
  });
  it('should call cancelIdea when action type is cancelIdea',()=>{
    component.actionType='cancelIdea';
    component.onClick();
    expect(ideaEvents.cancelIdea).toHaveBeenCalled();
  });
  it('should call closePopUp when action type is closePopUp',()=>{
    component.actionType='closePopUp';
    component.onClick();
    expect(ideaEvents.closePopUp).toHaveBeenCalled();
  });
  it('should call confirmPopUp when action type is confirmPopUp',()=>{
    component.actionType='confirmPopUp';
    component.onClick();
    expect(ideaEvents.confirmPopUp).toHaveBeenCalled();
  });
  it('should call prevIdea when action type is prevIdea',()=>{
    component.actionType='prevIdea';
    component.onClick();
    expect(ideaEvents.prevIdea).toHaveBeenCalled();
  });
  it('should call nextIdea when action type is nextIdea',()=>{
    component.actionType='nextIdea';
    component.onClick();
    expect(ideaEvents.nextIdea).toHaveBeenCalled();
  });
  it('should call assessIdea when action type is assessIdea',()=>{
    component.actionType='assessIdea';
    component.onClick();
    expect(ideaEvents.assessIdea).toHaveBeenCalled();
  });
  it('should call submitToHarmonization when action type is submitToHarmonization',()=>{
    component.actionType='submitToHarmonization';
    component.onClick();
    expect(ideaEvents.submitToHarmonization).toHaveBeenCalled();
  });
  it('should warn when action type is unknown',()=>{
    spyOn(console,'warn');
    component.actionType='invalidAction' as any;
    component.onClick();
    expect(console.warn).toHaveBeenCalledWith('Unhandled actionType:','invalidAction');
  });
});
