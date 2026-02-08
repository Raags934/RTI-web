
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IdeaDashboard } from './idea-dashboard';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { LoadIdeas } from '../../../store/idea.actions.js';
import { Idea } from '../../../models/idea.model.js';
import { IdeaEventsService } from '../../../events/ideaServiceEvents.js';
import { Subject } from 'rxjs';

// A tiny mock for IdeaEventsService that lets us emit events on demand
class IdeaEventsServiceMock {
  private subj = new Subject<any>();
  public events$ = this.subj.asObservable();
  emit(type: string, payload?: any) {
    this.subj.next({ type, payload });
  }
}

fdescribe('IdeaDashboard ', () => {
  let fixture: ComponentFixture<IdeaDashboard>;
  let component: IdeaDashboard;
  let store: MockStore;
  let dispatchSpy: jasmine.Spy;
  let ideaEvents: IdeaEventsServiceMock;

  // Utility to create mock ideas; relaxed typing so we can add fields freely
  const makeIdea = (overrides: Partial<Record<string, any>> = {}): Idea =>
    ({
      idea_uid: 'id-' + Math.random().toString(36).slice(2),
      name: 'Default',
      ta_id: 3,
      status_id: 1,
      target_aspirational_claim: 'Default Claim',
      research_proposal: 'Default Proposal',
      details: { score: 1 },
      ...overrides,
    } as unknown as Idea);

  beforeEach(async () => {
    ideaEvents = new IdeaEventsServiceMock();

    await TestBed.configureTestingModule({
      imports: [IdeaDashboard],
      providers: [
        provideMockStore({ initialState: { ideas: [] } }),
        { provide: IdeaEventsService, useValue: ideaEvents },
      ],
    })
      // Avoid loading the real external template/subcomponents—focus on TS logic.
      .overrideComponent(IdeaDashboard, {
        set: {
          template: '<div>Test Host</div>',
          // If needed, you can also clear imports here to avoid resolving child comps:
          // imports: [],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(IdeaDashboard);
    component = fixture.componentInstance;

    store = TestBed.inject(MockStore);
    dispatchSpy = spyOn(store, 'dispatch').and.callThrough();

    fixture.detectChanges(); // triggers ngOnInit()
  });

  it('should create and dispatch LoadIdeas on init', () => {
    expect(component).toBeTruthy();
    expect(dispatchSpy).toHaveBeenCalledWith(LoadIdeas());
  });

  it('should react to ideas stream: set ideas, applyAllFilters (All), update totals & status counts', () => {
    const ideas: Idea[] = [
      makeIdea({ idea_uid: 'A', ta_id: 3, status_id: 1, name: 'Alpha', details: { score: 2 } }),
      makeIdea({ idea_uid: 'B', ta_id: 3, status_id: 2, name: 'Beta', details: { score: 1 } }),
      makeIdea({ idea_uid: 'C', ta_id: 1, status_id: 1, name: 'Gamma', details: { score: 3 } }),
      makeIdea({
        idea_uid: 'D',
        ta_id: 3,
        status_id: 1,
        name: 'Delta',
        target_aspirational_claim: 'Claim X',
        research_proposal: 'Proposal Y',
        details: { score: 4 },
      }),
    ] as any;

    store.setState({ ideas } as any);

    expect(component.ideas.length).toBe(4);
    // With filters reset to All, filteredIdeas = all ideas
    expect(component.filteredIdeas.map((i: any) => i.idea_uid).sort()).toEqual(['A', 'B', 'C', 'D'].sort());
    expect(component.totalPages).toBe(1);
    expect(component.currentPage).toBe(1);
    expect(component.pagedIdeas.length).toBe(4);

    (component as any).statusTabs = [
      { status_id: undefined, count: 0 },
      { status_id: 1, count: 0 },
      { status_id: 2, count: 0 },
    ];
    component.updateStatusCounts();
    const tabs = (component as any).statusTabs;
    expect(tabs.find((t: any) => t.status_id === undefined).count).toBe(4);
    expect(tabs.find((t: any) => t.status_id === 1).count).toBe(3);
    expect(tabs.find((t: any) => t.status_id === 2).count).toBe(1);
  });

  it('taFilterChange should filter by TA, reset to page 1, and update paged items', () => {
    const ideas: Idea[] = [
      makeIdea({ ta_id: 3, name: 'X' }),
      makeIdea({ ta_id: 2, name: 'Y' }),
      makeIdea({ ta_id: 3, name: 'Z' }),
    ] as any;
    store.setState({ ideas } as any);

    component.taFilterChange(3);
    expect(component.filteredIdeas.every((i: any) => i.ta_id === 3)).toBeTrue();
    expect(component.currentPage).toBe(1);
    expect(component.pagedIdeas.length).toBe(2);
  });

  it('updatePagedIdeas should slice filteredIdeas based on currentPage and pageSize', () => {
    // Build 12 items to span 2 pages when pageSize=6
    component.filteredIdeas = Array.from({ length: 12 }).map((_, idx) => makeIdea({ name: 'N' + idx })) as any;
    component.pageSize = 6;
    component.totalPages = Math.ceil(component.filteredIdeas.length / component.pageSize);

    component.currentPage = 1;
    component.updatePagedIdeas();
    expect(component.pagedIdeas.length).toBe(6);

    component.changePage(2);
    expect(component.currentPage).toBe(2);
    expect(component.pagedIdeas.length).toBe(6);
  });

  it('changePage should ignore invalid pages and update for valid ones', () => {
    component.filteredIdeas = Array.from({ length: 8 }).map((_, idx) => makeIdea({ name: 'I' + idx })) as any;
    component.pageSize = 4;
    component.totalPages = Math.ceil(component.filteredIdeas.length / component.pageSize);
    component.currentPage = 1;

    // invalid (too high)
    component.changePage(3);
    expect(component.currentPage).toBe(1);

    // invalid (too low)
    component.changePage(0);
    expect(component.currentPage).toBe(1);

    // valid
    component.changePage(2);
    expect(component.currentPage).toBe(2);
  });

  it('applyFilter should filter ideas by a case-insensitive substring and reset to page 1', () => {
    component.ideas = [
      makeIdea({ title: 'FindMe', status_id: 1 }),
      makeIdea({ title: 'Other', status_id: 2 }),
    ] as any;

    component.applyFilter('find');
    expect(component.filteredIdeas.length).toBe(1);
    expect((component.filteredIdeas[0] as any).title).toBe('FindMe');
    expect(component.currentPage).toBe(1);
    expect(component.totalPages).toBe(1);
  });

  it('filterByStatus should support "All" (0) and specific status IDs', () => {
    component.ideas = [
      makeIdea({ status_id: 1 }),
      makeIdea({ status_id: 2 }),
      makeIdea({ status_id: 1 }),
    ] as any;

    component.filterByStatus(0);
    expect(component.filteredIdeas.length).toBe(3);

    component.filterByStatus(1);
    expect(component.filteredIdeas.length).toBe(2);
    expect(component.filteredIdeas.every((i: any) => i.status_id === 1)).toBeTrue();
  });

  it('filterBySearchText should use searchableKeys and TAC_or_RP special case', () => {
    // Override searchableKeys for deterministic test
    (component as any).searchableKeys = ['name', 'TAC_or_RP', 'details.score'];

    component.ideas = [
      makeIdea({
        name: 'Mars',
        target_aspirational_claim: 'ClaimZ',
        research_proposal: 'ProposalX',
        details: { score: 3 },
      }),
      makeIdea({
        name: 'Jupiter',
        target_aspirational_claim: 'ClaimY',
        research_proposal: 'ProposalW',
        details: { score: 7 },
      }),
    ] as any;

    // Search hits research_proposal via TAC_or_RP path
    component.filterBySearchText('posalx');
    expect(component.filteredIdeas.length).toBe(1);
    expect((component.filteredIdeas[0] as any).name).toBe('Mars');

    // Empty search resets to all
    component.filterBySearchText('   ');
    expect(component.filteredIdeas.length).toBe(2);
  });

  it('sortBy should sort on nested paths asc/desc', () => {
    component.filteredIdeas = [
      makeIdea({ name: 'A', details: { score: 5 } }),
      makeIdea({ name: 'B', details: { score: 2 } }),
      makeIdea({ name: 'C', details: { score: 9 } }),
    ] as any;

    component.sortBy('details.score', 'asc');
    expect((component.filteredIdeas[0] as any).details.score).toBe(2);
    expect((component.filteredIdeas[2] as any).details.score).toBe(9);

    component.sortBy('details.score', 'desc');
    expect((component.filteredIdeas[0] as any).details.score).toBe(9);
    expect((component.filteredIdeas[2] as any).details.score).toBe(2);
  });

  it('should handle IdeaEventsService events and call corresponding handlers', () => {
    const applyFilterSpy = spyOn(component, 'applyFilter').and.callThrough();
    const changePageSpy = spyOn(component, 'changePage').and.callThrough();
    const sortBySpy = spyOn(component, 'sortBy').and.callThrough();
    const filterByStatusSpy = spyOn(component, 'filterByStatus').and.callThrough();
    const filterBySearchTextSpy = spyOn(component, 'filterBySearchText').and.callThrough();
    const taFilterChangeSpy = spyOn(component, 'taFilterChange').and.callThrough();

    ideaEvents.emit('applyFilter', 'abc');
    ideaEvents.emit('changePage', 2);
    ideaEvents.emit('sortByColumn', { column: 'details.score', direction: 'asc' });
    ideaEvents.emit('applyFilterByStatus', { status_id: 1 });
    ideaEvents.emit('searchByText', { searchText: 'mars' });
    ideaEvents.emit('taFilterChange', 5);

    expect(applyFilterSpy).toHaveBeenCalledWith('abc');
    expect(changePageSpy).toHaveBeenCalledWith(2);
    expect(sortBySpy).toHaveBeenCalledWith('details.score', 'asc');
    expect(filterByStatusSpy).toHaveBeenCalledWith(1);
    expect(filterBySearchTextSpy).toHaveBeenCalledWith('mars');
    expect(taFilterChangeSpy).toHaveBeenCalledWith(5);
  });
 

  it('sortBy should hit the av === bv case (return 0) when values are equal', () => {
    // Build two ideas with the SAME status_id to trigger av === bv
    component.filteredIdeas = [
      makeIdea({ idea_uid: 'eq-1', status_id: 5 }),
      makeIdea({ idea_uid: 'eq-2', status_id: 5 }),
    ] as unknown as Idea[];
 
    const updateSpy = spyOn(component, 'updatePagedIdeas').and.callThrough();
 
    component.sortBy('status_id', 'asc');
 
    // sort ran and updated pagination
    expect(updateSpy).toHaveBeenCalled();
 
    // Both values equal => comparator returns 0 for the pair; order remains valid
    expect((component.filteredIdeas[0] as any).status_id).toBe(5);
    expect((component.filteredIdeas[1] as any).status_id).toBe(5);
  });
 


  it('ngOnDestroy should unsubscribe from IdeaEventsService subscription', () => {
    const sub = (component as any).sub;
    expect(sub).toBeTruthy();

    const unsubSpy = spyOn(sub, 'unsubscribe').and.callThrough();
    component.ngOnDestroy();
    expect(unsubSpy).toHaveBeenCalled();
  });
});
