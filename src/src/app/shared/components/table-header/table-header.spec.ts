import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableHeader } from './table-header';
import { IdeaEventsService } from '../../../events/ideaServiceEvents';
import { FormsModule } from '@angular/forms';
import { provideRouter,Router } from '@angular/router';

fdescribe('TableHeader', () => {
  let component: TableHeader;
  let fixture: ComponentFixture<TableHeader>;
  let ideaEventSpy: jasmine.SpyObj<IdeaEventsService>;
  let router:Router;

  beforeEach(async () => {
    ideaEventSpy = jasmine.createSpyObj('IdeaEventsService',['searchByText']);
    await TestBed.configureTestingModule({
      imports: [
        TableHeader,
      FormsModule],
      providers:[provideRouter([])]
     
    }).overrideProvider(IdeaEventsService,{
      useValue:ideaEventSpy
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should call searchByText when onSearch is called', () => {
    component.searchValue = '';
 
    component.onSearch();
 
    expect(ideaEventSpy.searchByText).toHaveBeenCalledWith('');
  });
 
  // onReset should clear searchvalue
  it('should reset searchvalue', () => {
    component.searchValue = 'Test';
 
    component.onReset();
 
    expect(component.searchValue).toBe('');
  });
 
  //  onReset should call service with empty string
  it('should call searchByText with empty string on reset', () => {
    component.searchValue = '';
 
    component.onReset();
 
    expect(ideaEventSpy.searchByText).toHaveBeenCalledWith('');
  });
  //should not run when search is empty
  it('should not  call searchByText when search value is empty', () => {
    component.searchValue = '';
 
    component.onSearch();
 
    expect(ideaEventSpy.searchByText).toHaveBeenCalledWith('');
  });
  //only entering spaces should not trigger search
  it('should not  call searchByText when search input has only spaces', () => {
    component.searchValue = '     ';
 
    component.onSearch();
 
    expect(ideaEventSpy.searchByText).toHaveBeenCalledWith('     ');
  });
  //reset should work even if it is already empty
  it('should still  call searchByText when reset is clicked with empty value', () => {
    component.searchValue = '';
 
    component.onReset();
 
    expect(ideaEventSpy.searchByText).toHaveBeenCalledWith('');
  });
});
