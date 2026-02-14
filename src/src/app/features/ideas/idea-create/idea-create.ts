import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { Buttons } from '../../../shared/components/buttons/buttons';
import { FormInput } from '../../../shared/components/form-input/form-input';
import { MatCardModule } from '@angular/material/card';
import { IdeaEventsService } from '../../../events/ideaServiceEvents';
import { Observable, Subscription } from 'rxjs';
import { IdeaService } from '../../../store/idea.service';
import { IdeaPayload } from '../../../models/idea.model';
import { Popup, PopupConfigs } from '../../../shared/constants/popUp';
import { PopUp } from '../../../shared/components/popup/popup';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../../app.state';
import { AddIdea, AddDraftIdea } from '../../../store/idea.actions';
import { toast, createIdeaToast } from '../../../shared/constants/toast';
import { Franchise } from '../../../models/productsList.model';
import { Dropdowns } from '../../../models/dropdown.model';
import { DropdownOption } from '../../../models/DropDownOption';
import {
  getLaunchClaimDropdown,
  getRtiYearDropdown,
  mapBrandsToDropdown,
  mapFranchisesToDropdown,
  mapProductsToDropdown,
  mapResearchPathwayToDropdown,
  mapTAsToDropdown,
  mapValueListToDropdown,
} from '../../../shared/functions/dropdownMapping';
import { IDEA_FORM_LABELS } from '../../../shared/constants/labels';
import { User } from '../../../models/user.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-idea-create',
  imports: [MatCardModule, Buttons, FormInput, ReactiveFormsModule, PopUp],
  templateUrl: './idea-create.html',
  styleUrl: './idea-create.scss',
})
export class IdeaCreate implements OnInit, OnDestroy {

  @Input() funtionName = "Franchise";

  form!: FormGroup;

  labels = IDEA_FORM_LABELS;

  franchiseOptions: DropdownOption[] = [];
  taOptions: DropdownOption[] = [];
  brandOptions: DropdownOption[] = [];
  productOptions: DropdownOption[] = [];

  researchPathwayOptions: DropdownOption[] = [];
  rtiYearOptions: DropdownOption[] = [];
  productTypeOptions: DropdownOption[] = [];
  originRequestOptions: DropdownOption[] = [];
  monadicComparativeOptions: DropdownOption[] = [];
  launchClaimOptions: DropdownOption[] = [];

  createIdeaToast: toast = createIdeaToast;

  productMap: Record<string | number, { brand_id: any; ta_id: any; franchise_id: any }> = {};

  private eventsSub!: Subscription;

  // Guard flags to prevent duplicate submissions from a single user action
  private hasSubmitted: boolean = false;
  private hasSavedDraft: boolean = false;

  popup: Popup = PopupConfigs.cancelIdea;

  user$: Observable<User | undefined>;
  franchises$: Observable<Franchise[] | undefined>;
  dropdowns$: Observable<Dropdowns | undefined>;
 

  constructor(
    private fb: FormBuilder,
    private ideaEvents: IdeaEventsService,
    private router: Router,
    private store: Store<AppState>,
    private authService: AuthService
  ) {
    this.user$ = this.store.select((state) => state.masterData?.data?.user);
    this.franchises$ = this.store.select((state) => state.masterData?.data?.franchises);
  this.dropdowns$ = this.store.select((state) => state.masterData?.data?.dropdowns);
  }

  ngOnInit(): void {
    this.user$.subscribe((list) => {
      if (!list) return;
      this.researchPathwayOptions = mapResearchPathwayToDropdown(list.research_pathways)
    });
    this.franchises$.subscribe((list) => {
      if (!list) return;

      this.franchiseOptions = mapFranchisesToDropdown(list);
      this.taOptions = mapTAsToDropdown(list);
      this.brandOptions = mapBrandsToDropdown(list);
      this.productOptions = mapProductsToDropdown(list);

      this.buildLookupMap();
    });

    this.dropdowns$.subscribe((list: Dropdowns | undefined) => {
      if (!list) return;

      const mapped: Record<string, DropdownOption[]> = {};
      Object.keys(list).forEach((key) => {
        mapped[key] = mapValueListToDropdown((list as any)[key]);
      });

      this.originRequestOptions = [{ id: 1, name: this.funtionName }
      ];
      this.productTypeOptions = mapped['Product Type'] ?? [];
      this.monadicComparativeOptions = mapped['Monadic or Comparative'] ?? [];
      this.launchClaimOptions = getLaunchClaimDropdown();
      this.rtiYearOptions = getRtiYearDropdown();
    });

    this.buildForm();
    this.setupAutoAssign();
    this.listenToEvents();
  }

  ngOnDestroy(): void {
    // Ensure we do not keep listening to shared IdeaEvents after component is destroyed,
    // otherwise a single "submitIdea" event can trigger multiple component instances.
    if (this.eventsSub) {
      this.eventsSub.unsubscribe();
    }
  }

  listenToEvents() {
    this.eventsSub = this.ideaEvents.events$.subscribe((event) => {
      if (event.type === 'submitIdea') {
        this.submitIdea();
      } else if (event.type === 'saveDraft') {
        this.saveDraft();
      } else if (event.type === 'cancelIdea') {
        this.cancelIdea();
      } else if (event.type === 'closePopUp') {
        this.popup.open = false;
      }
    });
  }

  buildLookupMap() {
    this.productMap = {};

    for (const product of this.productOptions as any[]) {
      const brand = this.brandOptions.find((b: any) => b.id === product.brand_id);
      const ta = this.taOptions.find((t: any) => t.id === brand?.ta_id);
      const franchise = this.franchiseOptions.find((f: any) => f.id === ta?.franchise_id);

      this.productMap[product.id] = {
        brand_id: brand?.id ?? null,
        ta_id: ta?.id ?? null,
        franchise_id: franchise?.id ?? null,
      };
    }
  }

  buildForm() {
    this.form = this.fb.group({
      pathway_id: new FormControl(null, Validators.required),
      rti_year: new FormControl(null, Validators.required),
      product_type: new FormControl(null, Validators.required),
      product_id: new FormControl(null, Validators.required),

      brand_id: new FormControl({ value: null, disabled: true }, Validators.required),
      ta_id: new FormControl({ value: null, disabled: true }, Validators.required),
      franchise_id: new FormControl({ value: null, disabled: true }, Validators.required),

      origin_request: new FormControl(null, Validators.required),

      strategic_rationale: new FormControl('', [Validators.required, Validators.minLength(10)]),

      monadic_or_comparative: new FormControl(null, Validators.required),
      target_aspirational_claim: new FormControl('', Validators.required),
      launch_claim: new FormControl(null, Validators.required),
      comment: new FormControl(''),
    });
  }

  setupAutoAssign() {
    this.form.get('product_id')?.valueChanges.subscribe((productId) => {
      if (!productId) return;

      const data = this.productMap[productId];
      if (!data) return;

      this.form.patchValue({
        brand_id: data.brand_id,
        ta_id: data.ta_id,
        franchise_id: data.franchise_id,
      });
    });
  }

  openPopUp(type: keyof typeof PopupConfigs) {
    if (type === 'submitIdea') {
      if (this.form.invalid) {
        this.form.markAllAsTouched();
        return;
      }
    }
    this.popup = PopupConfigs[type] ?? PopupConfigs.cancelIdea;
    this.popup.open = true;
  }

  cancelIdea(): void {
    this.popup.open = false;
    this.router.navigate(['/']);
  }

  saveDraft() {
    // Prevent multiple draft saves from a single user flow (e.g. accidental double click)
    if (this.hasSavedDraft) {
      return;
    }
    this.hasSavedDraft = true;

    const payload = this.prepareIdeaPayload();
    console.log('Save draft payload:', payload);
    this.store.dispatch(AddDraftIdea({ idea: payload }));
    this.popup.open = false;
    this.router.navigate(['/']);
  }

  submitIdea() {
    // Guard against duplicate submissions from the same confirmation click / event
    if (this.hasSubmitted) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      // Allow user to try again after fixing validation errors
      this.hasSubmitted = false;
      return;
    }

    this.hasSubmitted = true;

    const payload = this.prepareIdeaPayload();
    console.log(payload);
    this.store.dispatch(AddIdea({ idea: payload }));
    this.popup.open = false;
    this.router.navigate(['/']);
  }

  prepareIdeaPayload(): IdeaPayload {
    const raw = this.form.getRawValue();

    const rtiYear = Number(this.rtiYearOptions.find((y) => y.id === raw.rti_year)?.name);

    const productType =
      this.productTypeOptions.find((x) => x.id === raw.product_type)?.name ?? '';
    const originRequest =
      this.originRequestOptions.find((x) => x.id === raw.origin_request)?.name ?? '';
    const monadic =
      this.monadicComparativeOptions.find((x) => x.id === raw.monadic_or_comparative)?.name ?? '';
    const launchClaim = Boolean(
      this.launchClaimOptions.find((x) => x.id === raw.launch_claim)?.name ?? ''
    );

    return {
      pathway_id: raw.pathway_id,
      rti_year: rtiYear,
      product_type: productType,
      origin_request: originRequest,
      monadic_or_comparative: monadic,
      launch_claim: launchClaim,
      product_id: raw.product_id,
      brand_id: raw.brand_id,
      ta_id: raw.ta_id,
      franchise_id: raw.franchise_id,
      strategic_rationale: raw.strategic_rationale,
      target_aspirational_claim: raw.target_aspirational_claim,
      research_proposal: '',
      created_by: this.authService.getCurrentUserId() ?? 1,
      updated_by: this.authService.getCurrentUserId() ?? 1,
    };
  }
}
