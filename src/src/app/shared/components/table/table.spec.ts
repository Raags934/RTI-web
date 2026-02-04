import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IdeaEventsService } from '../../../events/ideaServiceEvents';
import { Table,TableColumn } from './table';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

fdescribe('Table', () => {
  let component: Table;
  let fixture: ComponentFixture<Table>;
  let events$: Subject<any>;
  let ideaEventSpy:any;
  let routerSpy: any;

  beforeEach(async () => {
    events$=new Subject();
    ideaEventSpy={
      events$: events$.asObservable(),
      sortByColumn:jasmine.createSpy('sortByColumn'),
      openOptions:jasmine.createSpy('openOptions')
    };
   
 routerSpy = {
  navigate: jasmine.createSpy('navigate').and.resolveTo(true)
};

    await TestBed.configureTestingModule({
      imports: [Table],
      providers:[
        { provide: IdeaEventsService,useValue:ideaEventSpy},
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Table);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should build displayedColumns on init',()=>{
    const cols:TableColumn[]=[
      {key:'name',label:'Name'},
      {key:'status',label:'Status'}
    ];
    component.columns=cols;
    component.ngOnInit();
    expect(component.displayedColumns).toEqual(['name','status']);
  });
  it('should update searchText when serachByText event is emitted',()=>{
    events$.next({
      type:'searchByText',
      payload:{searchText:''}
    });
    expect(component.searchText).toBe('');
  });
  it('should sort ascending when clicking a new column',()=>{
    component.onSort('name');
    expect(ideaEventSpy.sortByColumn).toHaveBeenCalledWith('name','asc');
    expect(component.getDirection('name')).toBe('asc');
  });
  it('should toggle sort direction when clicking same column again',()=>{
    component.onSort('name');
    component.onSort('name');
    expect(ideaEventSpy.sortByColumn).toHaveBeenCalledTimes(2);
    expect(ideaEventSpy.sortByColumn).toHaveBeenCalledWith('name','desc');
    expect(component.getDirection('name')).toBe('desc');
  });
  it('should toggle sort direction when back to asc from desc',()=>{
    component.onSort('name');
    component.onSort('name');
    component.onSort('name');
    expect(ideaEventSpy.sortByColumn).toHaveBeenCalledWith('name','asc');
    expect(component.getDirection('name')).toBe('asc');
  });
  it('should return the actual value when it is not empty',()=>{
    const obj={
      user:{
        name:'Karthik'
      }
    };
    const result=component.getValue(obj,'user.name');
    expect(result).toBe('Karthik');
  });
  it('should return null direction for inactive column',()=>{
    component.onSort('name');
    expect(component.getDirection('status')).toBeNull();
  });
 
 
  it('should return "....." for missing nested values',()=>{
    const obj={};
    expect(component.getValue(obj,'user.name')).toBe('.....');
  });
  it('should return TAC_or_RP formatted value for RP',()=>{
    const obj={research_proposal:'Proposal A'};
    expect(component.getValue(obj,'TAC_or_RP')).toBe('RP: Proposal A');
  });
  it('should return TAC_or_RP formatted value for TAC',()=>{
    const obj={target_aspirational_claim:'Claim 1'};
    expect(component.getValue(obj,'TAC_or_RP')).toBe('TAC: Claim 1');
  });
  it('should return "....." ifTAC and RP  both are empty',()=>{
    expect(component.getValue({},'TAC_or_RP')).toBe('.....');
  });
  it('should return color for valid statusId',()=>{
    component.statusColor=[
      {status_id:1,color:'green'},
      {status_id:2,color:'red'}
    ];
    expect(component.getStatusColor(1)).toBe('green');
  });
  it('should return color grey for unknown statusId',()=>{
    component.statusColor=[
      {status_id:1,color:'green'}
    ];
    expect(component.getStatusColor(99)).toBe('gray');
  });
  it('should openOptions when onOptionClick is called',()=>{
    const row={id:1,name:'Idea A'};
    component.onOptionsClick(row);
    expect(()=>component.onOptionsClick(row)).not.toThrow();
  });
  it('should navigate to idea details when viewIdea is called', async () => {
    component.from = 'dashboard';
    const key = 123;
 
    await component.viewIdea(key);
 
    expect(routerSpy.navigate).toHaveBeenCalledWith(
      ['/ideas/' + key],
      { queryParams: { from: 'dashboard' } }
    );
  });
 
});
