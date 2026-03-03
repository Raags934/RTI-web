import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { Observable, Subscription, combineLatest } from 'rxjs';
import { IdeaPayload, Idea } from '../../../models/idea.model';
import { Popup, PopupConfigs } from '../../../shared/constants/popUp';
import { PopUp } from '../../../shared/components/popup/popup';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../../app.state';
import { AddIdea, UpdateIdea } from '../../../store/idea.actions';
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
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-idea-draft-edit',
  imports: [MatCardModule, Buttons, FormInput, ReactiveFormsModule, PopUp],
  templateUrl: './idea-draft-edit.html',
  styleUrl: './idea-draft-edit.scss',
})
export class IdeaDraftEdit implements OnInit, OnDestroy {
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

  productMap: Record<string | number, { brand_id: any; ta_id: any; franchise_id: any }> = {};

  private eventsSub!: Subscription;
  private hasSubmitted = false;
  private hasSavedDraft = false;

  popup: Popup = PopupConfigs.cancelIdea;

  user$: Observable<User | undefined>;
  franchises$: Observable<Franchise[] | undefined>;
  dropdowns$: Observable<Dropdowns | undefined>;
  ideas$: Observable<Idea[]>;
  currentUser: User | undefined;

  ideaId: number | null = null;
  ideaUid: string | null = null;
  currentIdea: Idea | null = null;

  constructor(
    private fb: FormBuilder,
    private ideaEvents: IdeaEventsService,
    private router: Router,
    private route: ActivatedRoute,
    private store: Store<AppState>
  ) {
    this.user$ = this.store.select((state) => state.masterData?.data?.user);
    this.franchises$ = this.store.select((state) => state.masterData?.data?.franchises);
    this.dropdowns$ = this.store.select((state) => state.masterData?.data?.dropdowns);
    this.ideas$ = this.store.select((state) => state.ideas);
  }

  ngOnInit(): void {
    this.buildForm();
    this.setupAutoAssign();
    this.listenToEvents();

    this.route.paramMap.pipe(take(1)).subscribe((params) => {
      this.ideaUid = params.get('idea_uid');
    });

    combineLatest([
      this.user$.pipe(take(1)),
      this.franchises$.pipe(take(1)),
      this.dropdowns$.pipe(take(1)),
      this.ideas$.pipe(take(1)),
    ]).subscribe(([user, franchises, dropdowns, ideas]) => {
      this.currentUser = user;
      if (user) {
        this.researchPathwayOptions = mapResearchPathwayToDropdown(user.research_pathways);
      }
      if (franchises) {
        this.franchiseOptions = mapFranchisesToDropdown(franchises);
        this.taOptions = mapTAsToDropdown(franchises);
        this.brandOptions = mapBrandsToDropdown(franchises);
        this.productOptions = mapProductsToDropdown(franchises);
        this.buildLookupMap();
      }
      if (dropdowns) {
        const mapped: Record<string, DropdownOption[]> = {};
        Object.keys(dropdowns).forEach((key) => {
          mapped[key] = mapValueListToDropdown((dropdowns as any)[key]);
        });
        this.originRequestOptions = [{ id: 1, name: 'Franchise' }];
        this.productTypeOptions = mapped['Product Type'] ?? [];
        this.monadicComparativeOptions = mapped['Monadic or Comparative'] ?? [];
        this.launchClaimOptions = getLaunchClaimDropdown();
        this.rtiYearOptions = getRtiYearDropdown();
      }
      if (this.ideaUid) {
        const idea = ideas.find((i) => i.idea_uid === this.ideaUid);
        if (idea) {
          this.currentIdea = idea;
          this.ideaId = idea.idea_id;
          this.populateForm(idea);
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.eventsSub) {
      this.eventsSub.unsubscribe();
    }
  }

  populateForm(idea: Idea): void {
    const pathwayId = idea.pathway_id;
    const rtiYearOption = this.rtiYearOptions.find((opt) => Number(opt.name) === idea.rti_year);
    const rtiYearId = rtiYearOption?.id ?? idea.rti_year;
    const productTypeOption = this.productTypeOptions.find((opt) => opt.name === idea.product_type);
    const productTypeId = productTypeOption?.id ?? null;
    const productId = idea.product_id;
    const monadicOption = this.monadicComparativeOptions.find(
      (opt) => opt.name === idea.monadic_or_comparative
    );
    const monadicId = monadicOption?.id ?? null;
    const launchClaimId = idea.launch_claim ? 1 : 2;
    const originOption = this.originRequestOptions.find((opt) => opt.name === idea.origin_request);
    const originId = originOption?.id ?? 1;

    this.form.patchValue({
      pathway_id: pathwayId,
      rti_year: rtiYearId,
      product_type: productTypeId,
      product_id: productId,
      brand_id: idea.brand_id,
      ta_id: idea.ta_id,
      franchise_id: idea.franchise_id,
      origin_request: originId,
      strategic_rationale: idea.strategic_rationale,
      monadic_or_comparative: monadicId,
      target_aspirational_claim: idea.target_aspirational_claim,
      launch_claim: launchClaimId,
    });
  }

  listenToEvents(): void {
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

  buildLookupMap(): void {
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

  buildForm(): void {
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

  setupAutoAssign(): void {
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

  openPopUp(type: keyof typeof PopupConfigs): void {
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

  saveDraft(): void {
    if (this.hasSavedDraft) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.popup.open = false;
      return;
    }
    if (!this.ideaId) {
      this.popup.open = false;
      return;
    }
    this.hasSavedDraft = true;
    const payload = this.prepareIdeaPayload();
    // PUT api does not manage approved; omit it from payload for Save as Draft
    const { approved, ...payloadWithoutApproved } = payload;
    this.store.dispatch(UpdateIdea({ ideaId: this.ideaId, idea: payloadWithoutApproved as IdeaPayload }));
    this.popup.open = false;
    this.router.navigate(['/']);
  }

  submitIdea(): void {
    if (this.hasSubmitted) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.hasSubmitted = false;
      this.popup.open = false;
      return;
    }
    if (!this.ideaId) {
      this.popup.open = false;
      return;
    }
    this.hasSubmitted = true;
    const payload = this.prepareIdeaPayload();
    // Draft-only edit page Submit: always send approved false (only for this page/submit)
    const addPayload: IdeaPayload = { ...payload, idea_id: this.ideaId, approved: false };
    this.store.dispatch(AddIdea({ idea: addPayload }));
    this.popup.open = false;
    this.router.navigate(['/ideas/' + this.ideaUid]);
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
      this.launchClaimOptions.find((x) => x.id === raw.launch_claim)?.name === 'Yes'
    );

    let approved = false;
    if (this.currentUser?.roles && this.currentUser?.functions) {
      const hasCreatorRole = this.currentUser.roles.some(
        (role) => role.role_name === 'Creator/Approver'
      );
      const hasFranchiseBusinessFunction = this.currentUser.functions.some(
        (func) => func.function_type === 'Business Function' && func.function_name === 'Franchise'
      );
      approved = hasCreatorRole && hasFranchiseBusinessFunction;
    }

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
      created_by: this.currentIdea?.created_by?.user_id ?? 2,
      updated_by: 1,
      approved,
    };
  }
}
