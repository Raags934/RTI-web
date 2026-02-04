import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableFilter } from './table-filter';


fdescribe('TableFilter', () => {
  let component: TableFilter;
  let fixture: ComponentFixture<TableFilter>;
  const mockIdeaEvents={
    applyFilterByStatus: jasmine.createSpy('applyFilterByStatus')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableFilter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableFilter);
    component = fixture.componentInstance;
    component.tabs=[
      { label:'All',status_id:null},
      { label:'Open',status_id:1},
      { label:'Closed',status_id:2}
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should set activeTab and when applyFilterByStatus with correct status id',()=>{
    const tab={label:'Closed',status_id:2};
    component.selectTab(tab);
    expect(component.activeTab).toBe('Closed');
   
  });
  it('should set activeTab and when selectTab is called',()=>{
    const tab={label:'Open',status_id:1};
    component.selectTab(tab);
    expect(component.activeTab).toBe('Open');
   
  });

});
