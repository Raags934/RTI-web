import { TestBed,fakeAsync,tick } from '@angular/core/testing';
import { IdeaEventsService } from './events/ideaServiceEvents';
import { RouterTestingModule } from '@angular/router/testing';
import { loadMasterData } from './store/masterData/masterData.actions';
import { App } from './app';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';

fdescribe('App', () => {
  let component: App;
  let fixture:any;
  let events$:Subject<any>;
  let storeSpy:any;
  beforeEach(async () => {
    events$=new Subject();
    const ideaEventsMock={
      events$:events$.asObservable()
    };
    storeSpy={
      dispatch:jasmine.createSpy('dispatch')
    };
    await TestBed.configureTestingModule({
      imports: [App,RouterTestingModule],
      providers:[
        {provide: IdeaEventsService,useValue:ideaEventsMock},
        {provide:Store,useValue:storeSpy}
      ]
    }).compileComponents();
    fixture=TestBed.createComponent(App);
    component=fixture.componentInstance;
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    const component=fixture.componentInstance;
    expect((component as any).title()).toBe('src');
    // fixture.detectChanges();
    // const compiled = fixture.nativeElement as HTMLElement;
    //  expect(compiled.querySelector('h1')?.textContent).toContain('Hello, src');
    // const text=fixture.nativeElement.textContent;
    // expect(text).toContain('src');
  });
  //store.dispatch
  it('should dispatch masterdata on init',()=>{
    component.ngOnInit();
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      loadMasterData({email:'karthik@example.com'})
    );
  });
  //toastEvent->showToast
  it('should call showToast when toastEvent is emitted',()=>{
    spyOn(component,'showToast');
    component.ngOnInit();
    events$.next({
      type:'toastEvent',
      payload:'Idea created'
    });
    expect(component.showToast).toHaveBeenCalledWith('Idea created');
  });
  //toastLogic + setTimeout
  it('should show and auto-hide toast',fakeAsync(()=>{
    component.showToast('Saved');
    expect(component.createIdeaToast.message).toBe('Saved');
    expect(component.createIdeaToast.visible).toBeTrue();
    tick(7000);
    expect(component.createIdeaToast.visible).toBeFalse();
  }));
});
