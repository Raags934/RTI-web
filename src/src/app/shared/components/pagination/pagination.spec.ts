import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pagination } from './pagination';
 
fdescribe('Pagination', () => {
 
  let component: Pagination;
  let fixture: ComponentFixture<Pagination>;
 
  // Mock service
  const mockIdeaEvents = {
    changePage: jasmine.createSpy('changePage')
  };
 
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pagination],
     
    }).compileComponents();
 
    fixture = TestBed.createComponent(Pagination);
    component = fixture.componentInstance;
 
    // Inject mock manually since the service has no class
    (component as any).ideaEvents = mockIdeaEvents;
    mockIdeaEvents.changePage.calls.reset();
 
    fixture.detectChanges();
  });
 
  // -------------------
  // Component creation
  // -------------------
  it('should create', () => {
    expect(component).toBeTruthy();
  });
 
  // -------------------
  // paginationItems
  // -------------------
  it('should return all pages when totalPages <= 6', () => {
    component.totalPages = 5;
 
    expect(component.paginationItems).toEqual([1, 2, 3, 4, 5]);
  });
 
  it('should return pages with ellipsis when totalPages > 6', () => {
    component.totalPages = 12;
 
    expect(component.paginationItems).toEqual([1, 2, 3, 4, 5, 'ellipsis', 12]);
  });
 
  // -------------------
  // prev()
  // -------------------
  it('should call changePage with previous page', () => {
    component.currentPage = 4;
 
    component.prev();
 
    expect(mockIdeaEvents.changePage).toHaveBeenCalledWith(3);
  });
 
  it('should not call changePage when already on first page', () => {
    component.currentPage = 1;
 
    component.prev();
 
    expect(mockIdeaEvents.changePage).not.toHaveBeenCalled();
  });
 
  // -------------------
  // next()
  // -------------------
  it('should call changePage with next page', () => {
    component.currentPage = 2;
    component.totalPages = 5;
 
    component.next();
 
    expect(mockIdeaEvents.changePage).toHaveBeenCalledWith(3);
  });
 
  it('should not call changePage when already on last page', () => {
    component.currentPage = 5;
    component.totalPages = 5;
 
    component.next();
 
    expect(mockIdeaEvents.changePage).not.toHaveBeenCalled();
  });
 
  // -------------------
  // selectPage()
  // -------------------
  it('should call changePage for valid page', () => {
    component.totalPages = 10;
 
    component.selectPage(6);
 
    expect(mockIdeaEvents.changePage).toHaveBeenCalledWith(6);
  });
 
  it('should not call changePage for invalid page', () => {
    component.totalPages = 10;
 
    component.selectPage(20);
 
    expect(mockIdeaEvents.changePage).not.toHaveBeenCalled();
  });
 
});