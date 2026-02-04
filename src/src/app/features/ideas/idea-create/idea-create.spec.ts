
import { BehaviorSubject, Subject, of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { IdeaCreate } from './idea-create';
import { PopupConfigs } from '../../../shared/constants/popUp';
import { AddIdea } from '../../../store/idea.actions';
import { Router } from '@angular/router';
import { IdeaEventsService } from '../../../events/ideaServiceEvents';
import { Store } from '@ngrx/store';
// import { provideMockStore,MockStore } from '@ngrx/store/testing';

fdescribe('IdeaCreate Component (unit)', () => {
  let component: IdeaCreate;

  // Mocks
  class MockRouter {
    navigate = jasmine.createSpy('navigate');
  }

  class MockIdeaEventsService {
    public events$ = new Subject<any>();
  }

  class MockStore {
    private selectQueue: any[] = [];
    dispatch = jasmine.createSpy('dispatch');
    select = jasmine.createSpy('select').and.callFake((_selector: any) => {
      return this.selectQueue.shift() || of(undefined);
    });

    queueSelects(streams: any[]) {
      this.selectQueue = [...streams];
    }
  }

  let mockRouter: MockRouter;
  let mockStore: MockStore;
  let mockEvents: MockIdeaEventsService;

  // 🔥 ADD THESE so tests can access dropdowns$ globally
  let user$: BehaviorSubject<any>;
  let franchises$: BehaviorSubject<any>;
  let dropdowns$: BehaviorSubject<any>;

  beforeEach(() => {
    mockRouter = new MockRouter();
    mockStore = new MockStore();
    mockEvents = new MockIdeaEventsService();

    user$ = new BehaviorSubject<any>(undefined);
    franchises$ = new BehaviorSubject<any>(undefined);
    dropdowns$ = new BehaviorSubject<any>(undefined);

    mockStore.queueSelects([
      user$.asObservable(),
      franchises$.asObservable(),
      dropdowns$.asObservable(),
    ]);

    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        { provide: Router, useValue: mockRouter },
        { provide: IdeaEventsService, useValue: mockEvents },
        { provide: Store, useValue: mockStore }
      ]
    });

    component = TestBed.createComponent(IdeaCreate).componentInstance;
    component.ngOnInit();

    user$.next({
      id: 42,
      research_pathways: [{ id: 1, name: 'Pathway A' }]
    });

    franchises$.next([]);

    // Initial load is EMPTY (keep as is)
    dropdowns$.next({});
  });

  afterEach(() => {
    mockEvents.events$.complete();
  });

  function makeFormValidWithValues(options?: any) {
    const {
      rtiYearId = 101,
      rtiYearName = '2027',
      productTypeId = 10,
      productTypeName = 'Device',
      originId = 1,
      originName = component.funtionName,
      monadicId = 2,
      monadicName = 'Comparative',
      launchId = 6,
      launchName = 'Yes',
      productId = 99,
      brandId = 300,
      taId = 200,
      franchiseId = 100,
    } = options || {};

    component.rtiYearOptions = [{ id: rtiYearId, name: rtiYearName }];
    component.productTypeOptions = [{ id: productTypeId, name: productTypeName }];
    component.originRequestOptions = [{ id: originId, name: originName }];
    component.monadicComparativeOptions = [{ id: monadicId, name: monadicName }];
    component.launchClaimOptions = [
      { id: 5, name: '' },
      { id: launchId, name: launchName },
    ];

    component.productMap = {
      [productId]: {
        brand_id: brandId,
        ta_id: taId,
        franchise_id: franchiseId,
      },
    };

    component.form.patchValue({
      pathway_id: 1,
      rti_year: rtiYearId,
      product_type: productTypeId,
      product_id: productId,
      origin_request: originId,
      strategic_rationale: 'A valid rationale with more than ten chars.',
      monadic_or_comparative: monadicId,
      target_aspirational_claim: 'Target claim content',
      launch_claim: launchId,
      comment: 'Optional comment',
    });
  }

  it('should create and initialize form and options', () => {
    expect(component).toBeTruthy();
    expect(component.form).toBeDefined();
    expect(component.originRequestOptions.length).toBe(1);
    expect(component.originRequestOptions[0].name).toBe(component.funtionName);
    expect(component.researchPathwayOptions.length).toBeGreaterThan(0);
  });

  it('buildLookupMap should build productMap for valid and missing relations', () => {
    component.franchiseOptions = [{
      id: 100,
      name: ''
    }];
    component.taOptions = [{
      id: 200, franchise_id: 100,
      name: ''
    }];
    component.brandOptions = [{
      id: 300, ta_id: 200,
      name: ''
    }];

    component.productOptions = [
      {
        id: 400, brand_id: 300,
        name: ''
      },
      {
        id: 401, brand_id: 999,
        name: ''
      }
    ];

    component.buildLookupMap();

    expect(component.productMap[400]).toEqual({
      brand_id: 300,
      ta_id: 200,
      franchise_id: 100
    });

    expect(component.productMap[401]).toEqual({
      brand_id: null,
      ta_id: null,
      franchise_id: null
    });
  });
 

  it('constructor should select user, franchises, and dropdowns exactly once each', () => {
    // Reuse the spy created in MockStore (avoid spyOn here!)
    const selectSpy = mockStore.select as jasmine.Spy;
 
    // Provide new return values for the next constructor run
    selectSpy.and.returnValues(
      user$.asObservable(),
      franchises$.asObservable(),
      dropdowns$.asObservable()
    );
 
    // Count current calls done by the initial instance made in beforeEach
    const before = selectSpy.calls.count();
 
    // Create a fresh instance so its constructor runs now (and calls select 3 times)
    const fresh = TestBed.createComponent(IdeaCreate).componentInstance;
 
    // Verify only the new constructor's calls (delta) = 3
    expect(selectSpy.calls.count() - before).toBe(3);
 
    // Sanity: fields assigned
    expect(fresh.user$).toBeDefined();
    expect(fresh.franchises$).toBeDefined();
    expect(fresh.dropdowns$).toBeDefined();
  });


  /* ADD THIS TEST (COVERS mapped[key] = mapValueListToDropdown(...))  */
  it('should cover mapped[key] assignment by emitting non-empty dropdowns', () => {
    dropdowns$.next({
      'Product Type': [{ id: 10, name: 'Device' }],
      'Monadic or Comparative': [{ id: 20, name: 'Comparative' }]
    });

    expect(Array.isArray(component.productTypeOptions)).toBeTrue();
    expect(Array.isArray(component.monadicComparativeOptions)).toBeTrue();
  });

  it('setupAutoAssign: should early-return when productMap entry does NOT exist', () => {
    component.productMap = {};
    component.form.get('product_id')?.setValue(999);
    const raw = component.form.getRawValue();
    expect(raw.brand_id).toBeNull();
    expect(raw.ta_id).toBeNull();
    expect(raw.franchise_id).toBeNull();
  });

  it('setupAutoAssign should patch brand/ta/franchise on product change', () => {
    component.productMap = { 99: { brand_id: 300, ta_id: 200, franchise_id: 100 } };
    component.form.get('product_id')?.setValue(99);
    const raw = component.form.getRawValue();
    expect(raw.brand_id).toBe(300);
    expect(raw.ta_id).toBe(200);
    expect(raw.franchise_id).toBe(100);
  });

  it('openPopUp should not open submit popup when form invalid', () => {
    component.openPopUp('submitIdea');
    expect(component.popup.open).toBeFalse();
  });

  it('openPopUp should open submit popup when form is valid', () => {
    makeFormValidWithValues();
    component.openPopUp('submitIdea');
    expect(component.popup.open).toBeTrue();
  });

  it('openPopUp should open cancel popup and fallback for unknown type', () => {
    component.openPopUp('cancelIdea');
    expect(component.popup.open).toBeTrue();
    component.openPopUp('unknown' as any);
    expect(component.popup.open).toBeTrue();
  });

  it('cancelIdea should close popup and navigate home', () => {
    component.popup.open = true;
    component.cancelIdea();
    expect(component.popup.open).toBeFalse();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('prepareIdeaPayload TRUE case', () => {
    makeFormValidWithValues();
    const payload = component.prepareIdeaPayload();
    expect(payload.launch_claim).toBeTrue();
  });

  it('prepareIdeaPayload FALSE case', () => {
    makeFormValidWithValues({ launchId: 5, launchName: '' });
    const payload = component.prepareIdeaPayload();
    expect(payload.launch_claim).toBeFalse();
  });

  it('saveDraft should log and navigate', () => {
    makeFormValidWithValues();
    spyOn(console, 'log');
    component.popup.open = true;
    component.saveDraft();
    expect(component.popup.open).toBeFalse();
    expect(console.log).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('submitIdea should NOT dispatch when invalid', () => {
    component.form.reset();
    component.submitIdea();
    expect(mockStore.dispatch).not.toHaveBeenCalled();
  });

  it('submitIdea should dispatch when valid', () => {
    makeFormValidWithValues();
    spyOn(console, 'log');
    component.submitIdea();
    expect(mockStore.dispatch).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('listenToEvents routes events to correct functions', () => {
    const spySubmit = spyOn(component, 'submitIdea').and.callThrough();
    const spySave = spyOn(component, 'saveDraft').and.callThrough();
    const spyCancel = spyOn(component, 'cancelIdea').and.callThrough();

    makeFormValidWithValues();

    mockEvents.events$.next({ type: 'submitIdea' });
    mockEvents.events$.next({ type: 'saveDraft' });
    mockEvents.events$.next({ type: 'cancelIdea' });

    expect(spySubmit).toHaveBeenCalled();
    expect(spySave).toHaveBeenCalled();
    expect(spyCancel).toHaveBeenCalled();
   
  component.popup.open = true;
  mockEvents.events$.next({ type: 'closePopUp' });
  expect(component.popup.open).toBeFalse();

  });
});
