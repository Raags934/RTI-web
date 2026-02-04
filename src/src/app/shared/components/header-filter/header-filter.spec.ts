import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore,provideMockStore } from '@ngrx/store/testing';
import { HeaderFilter } from './header-filter';
import { ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { IdeaEventsService } from '../../../events/ideaServiceEvents';

const mockUser={
  roles:[{id:1,name:'Admin'}],
    functions:[{id:10,name:'IT'}]
 
};
const mockFranchise=[
  {
  id:1,
  name:'Franchise A',
  tas:[
    {id:100,name:'TA 1'},
    {id:101,name:'TA 2'}
  ]
}
];

const mockStore={
  select:jasmine.createSpy().and.callFake((selector:any)=>{
    const fakeState={
      masterData:{
        data:{
          user:mockUser,
          franchise:mockFranchise
        }
      }
    };
    return of(selector(fakeState));
  })
};
class MockIdeaEventService{
  taFilterChange=jasmine.createSpy('taFilterChange');
  franchiseFilterChange=jasmine.createSpy('franchiseFilterChange');
}

fdescribe('HeaderFilter', () => {
  let component: HeaderFilter;
  let fixture: ComponentFixture<HeaderFilter>;
  let eventService:MockIdeaEventService;
  let store:MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderFilter,ReactiveFormsModule],
      providers:[
        // {provide:Store,useValue:mockStore},
        provideMockStore({
          initialState:{
            masterData:{
              data:{
                user:mockUser,
                franchise:mockFranchise
              }
            }
          }
        }),
        {provide:IdeaEventsService,useClass:MockIdeaEventService}
      ]
    })
    .compileComponents();
    store=TestBed.inject(MockStore);

    fixture = TestBed.createComponent(HeaderFilter);
    component = fixture.componentInstance;
    eventService=TestBed.inject(IdeaEventsService) as any;
    fixture.detectChanges(); //ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
   });
  it('should initialize filter form',()=>{
    expect(component.filterForm.get('franchise')).toBeTruthy();
    expect(component.filterForm.get('ta')).toBeTruthy();
    expect(component.filterForm.get('role')).toBeTruthy();
    expect(component.filterForm.get('function')).toBeTruthy();
  });
   it('should load role and function dropdowns from store',()=>{
    expect(component.roleOptions.length).toBe(1);
    expect(JSON.stringify(component.roleOptions[0])).toContain('');
    expect(component.roleOptions.length).toBe(1);
    expect(JSON.stringify(component.roleOptions[0])).toContain('');
   });
   it('should not set role and function options when user is null',()=>{
    component.user$=of(null as any);
    component.ngOnInit();
    expect(component.roleOptions.length).toBe(1);
    expect(component.functionsOptions.length).toBe(1);
   });
   it('should map franchise and TA options when franchises$ emits',()=>{
    component.ngOnInit();
    expect(component.franchiseOptions.length).toBe(0);
    expect(component.taOptions.length).toBe(0);
   })
   it('should load the franchise dropdowns',()=>{
    component.franchises$=of(mockFranchise as any);
    component.user$=of(mockUser as any);
    expect(component.franchiseOptions.length).toBe(0);
    expect(component.taOptions.length).toBe(0);
   });    
  it('should call taFilterChange when TA is selected',()=>{
    component.filterForm.get('ta')?.setValue('100');
    expect(eventService.taFilterChange).toHaveBeenCalledWith(100);
  });
  it('should not call taFilterChange when TA is not selected',()=>{
    component.filterForm.get('ta')?.setValue(null);
    expect(eventService.taFilterChange).not.toHaveBeenCalled();
  });
  it('should log franchise change',()=>{
    spyOn(console,'log');
    component.filterForm.get('franchise')?.setValue('1');
    expect(console.log).toHaveBeenCalledWith('1');
  });
  it('should not log franchiseId is empty',()=>{
    spyOn(console,'log');
    component.filterForm.get('franchise')?.setValue(null);
    expect(console.log).not.toHaveBeenCalled();
  });
});
