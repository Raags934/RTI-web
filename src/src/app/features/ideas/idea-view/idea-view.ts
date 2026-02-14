import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { Observable, Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';

import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { FormInput } from '../../../shared/components/form-input/form-input';
import { VIEW_IDEA_FORM_LABELS } from '../../../shared/constants/labels';
import { Idea } from '../../../models/idea.model';
import { AppState } from '../../../app.state.js';
import { LoadIdeas } from '../../../store/idea.actions';
import { IdeaService } from '../../../store/idea.service';
import { StudyDetailsPayload } from '../../../models/study-details.model';
import { Buttons } from '../../../shared/components/buttons/buttons';
import { statusColor } from '../../../shared/constants/statusColor';
import { IdeaEventsService } from '../../../events/ideaServiceEvents';
import { Popup, PopupConfigs } from '../../../shared/constants/popUp';
import { PopUp } from '../../../shared/components/popup/popup';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-idea-view',
  imports: [CommonModule, FormInput, Buttons, PopUp, ReactiveFormsModule],
  templateUrl: './idea-view.html',
  styleUrl: './idea-view.scss',
  host: { '[class.overlay-mode]': 'overlayMode' },
})
export class IdeaView implements OnInit, OnDestroy {
  labels = VIEW_IDEA_FORM_LABELS;

  form!: FormGroup;

  ideas$: Observable<Idea[]>;
  ideas: Idea[] = [];

  viewIdea: Idea | null = null;
  index = -1;
  statusColor = statusColor;

  /** Options for Recommended (Enter Study Details form). */
  recommendedOptions = [
    { id: 'Yes', name: 'Yes' },
    { id: 'No', name: 'No' },
  ];

  /** Options for Regions Accepting Submissions (APAC, Americas, etc.). */
  regionsAcceptingSubmissionsOptions = [
    { id: 'APAC', name: 'APAC' },
    { id: 'Americas', name: 'Americas' },
    { id: 'China', name: 'China' },
    { id: 'Europe', name: 'Europe' },
    { id: 'Latam', name: 'Latam' },
    { id: 'Japan', name: 'Japan' },
  ];

  /** Query param indicating assessor/harmonizer mode. */
  from = '';

  /** Popup configurations for assessor / harmonizer flows. */
  popup: Popup = PopupConfigs.abandonIdea;
  needMoreInfoPopup: Popup = PopupConfigs.needMoreInfo;
  assessIdeaPopup: Popup = PopupConfigs.assessIdea;
  submitToHarmonizationPopup: Popup = PopupConfigs.submitToHarmonization;
  enterStudyDetailsPopup: Popup = PopupConfigs.enterStudyDetails;
  submitStudyDetailsConfirmationPopup: Popup =
    PopupConfigs.submitStudyDetailsConfirmation;

  /** Status label used for both full-page and overlay modes. */
  statusLabel = '.....';

  // Track where user came from
  referrer: string | null = null;
  showProductRank = false;
  showTaRank = false;

  /** Accordion open state for View Idea Details (Study Details, Prioritization 1 & 2). */
  accordionStudyDetailsOpen = false;
  accordionPrioritizationOneOpen = false;
  accordionPrioritizationTwoOpen = false;

  /** Accordion open state for Enter Study Details popup form (Study Details section). */
  enterStudyDetailsSectionOpen = true;

  /** Minimum date for Estimated Start Date (today) - prevents selecting past dates. */
  get minStartDate(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  /** When true, idea is driven by overlayIdeaUid (no route). */
  @Input() overlayMode = false;
  private _overlayIdeaUid: string | null = null;
  overlayIdeaUid$ = new BehaviorSubject<string | null>(null);

  @Input() set overlayIdeaUid(v: string | null) {
    this._overlayIdeaUid = v;
    this.overlayIdeaUid$.next(v);
  }

  @Input() overlayReferrer: string | null = null;
  @Input() overlayStatusLabel: string | null = null;
  @Output() editDetails = new EventEmitter<Idea>();

  private sub!: Subscription;
  private overlaySub?: Subscription;

  constructor(
    private ideaEvents: IdeaEventsService,
    private fb: FormBuilder,
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private router: Router,
    private ideaService: IdeaService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {
    this.ideas$ = this.store.select((state) => state.ideas);

    this.sub = this.ideaEvents.events$.subscribe((event) => {
      if (event.type === 'nextIdea') {
        this.nextIdeaView();
      } else if (event.type === 'prevIdea') {
        this.prevIdeaView();
      } else if (event.type === 'abandonIdea') {
        this.abandonIdea();
      } else if (event.type === 'needMoreInfo') {
        this.needMoreInfo();
      } else if (event.type === 'assessIdea') {
        this.assessIdea();
      } else if (event.type === 'submitToHarmonization') {
        this.submitToHarmonization();
      } else if (event.type === 'enterStudyDetails') {
        this.enterStudyDetails();
      } else if (event.type === 'submitStudyDetailsConfirmation') {
        this.submitStudyDetailsConfirmation();
      } else if (event.type === 'closePopUp') {
        if (this.submitStudyDetailsConfirmationPopup.open) {
          // Close only the confirmation popup
          this.submitStudyDetailsConfirmationPopup.open = false;
        } else {
          // Close other popups
          this.popup.open = false;
          this.needMoreInfoPopup.open = false;
          this.assessIdeaPopup.open = false;
          this.submitToHarmonizationPopup.open = false;
          this.enterStudyDetailsPopup.open = false;

          if (this.from === 'assessor') {
            // Reset assessIdeaPopup form fields when closed
            this.form.patchValue({
              study_recommended: null,
              pos: null,
              pos_reasons: '',
              ef_assessment_comments: '',
            });
          }
          if (this.from === 'harmonizer') {
            // Reset enterStudyDetailsPopup form fields when closed
            this.form.patchValue({
              recommended: null,
              pilot: null,
              research_questions: '',
              potential_claims: '',
              primary_endpoints: '',
              secondary_endpoints: '',
              estimated_study_start_date: null,
              estimated_study_end_date: null,
              estimated_sample_size: '',
              total_estimated_budget: '',
              budget_currency: '',
              estimated_spend_plus_1: '',
              estimated_spend_plus_2: '',
              estimated_spend_plus_3: '',
              study_details_pos: '',
              regions_accepting_submissions: null,
            });
            this.applyStudyDetailsFieldsState();
          }
        }
      }
    });
  }

  ngOnInit(): void {
    this.buildForm();

    // Load ideas if empty
    this.ideas$.pipe(take(1)).subscribe((ideas) => {
      if (!ideas.length) this.store.dispatch(LoadIdeas());
    });

    if (this.overlayMode) {
      this.referrer = this.overlayReferrer;
      if (this.referrer === '/prioritization') {
        this.showProductRank = true;
        this.showTaRank = false;
      } else if (this.referrer === '/ta-prioritization') {
        this.showProductRank = true;
        this.showTaRank = true;
      }

      this.overlaySub = combineLatest([this.ideas$, this.overlayIdeaUid$]).subscribe(
        ([ideas, ideaUid]) => {
          this.ideas = ideas;
          const { index, idea } = this.getIdeasByIdeaUid(ideaUid);
          this.index = index;
          this.viewIdea = idea;
          if (this.viewIdea) {
            this.statusLabel =
              this.overlayStatusLabel ?? this.getDefaultStatusLabel(this.viewIdea);
            this.patchForm(this.viewIdea);
          } else {
            this.statusLabel = this.overlayStatusLabel ?? '.....';
          }
        }
      );
      return;
    }

    // Full-page mode: combine route params + query params + ideas stream
    combineLatest([this.route.paramMap, this.route.queryParamMap, this.ideas$]).subscribe(
      ([params, queryParams, ideas]) => {
        this.ideas = ideas;

        this.referrer = queryParams.get('from');
        // Normalize so both '/harmonizer' and 'harmonizer' show harmonizer buttons (same for assessor)
        this.from = (this.referrer || '').replace(/^\//, '') || '';
        const statusLabelFromQuery = queryParams.get('statusLabel');

        if (this.referrer === '/prioritization') {
          this.showProductRank = true;
          this.showTaRank = false;
        } else if (this.referrer === '/ta-prioritization') {
          this.showProductRank = true;
          this.showTaRank = true;
        }

        const ideaUid = params.get('idea_uid');
        const { index, idea } = this.getIdeasByIdeaUid(ideaUid);

        this.index = index;
        this.viewIdea = idea;

        if (this.viewIdea) {
          this.statusLabel =
            statusLabelFromQuery || this.getDefaultStatusLabel(this.viewIdea);
          this.patchForm(this.viewIdea);
        } else {
          this.statusLabel = statusLabelFromQuery || '.....';
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.overlaySub?.unsubscribe();
    this.sub?.unsubscribe();
  }

  private buildForm() {
    this.form = this.fb.group({
      pathway_id: new FormControl(null, Validators.required),
      rti_year: new FormControl(null, Validators.required),
      product_type: new FormControl(null, Validators.required),
      product_id: new FormControl(null, Validators.required),

      brand_id: new FormControl(
        { value: null, disabled: true },
        Validators.required
      ),
      ta_id: new FormControl(
        { value: null, disabled: true },
        Validators.required
      ),
      franchise_id: new FormControl(
        { value: null, disabled: true },
        Validators.required
      ),

      origin_request: new FormControl(null, Validators.required),

      strategic_rationale: new FormControl('', [
        Validators.required,
        Validators.minLength(10),
      ]),

      monadic_or_comparative: new FormControl(null, Validators.required),
      target_aspirational_claim: new FormControl('', Validators.required),
      launch_claim: new FormControl(null, Validators.required),
      comment: new FormControl(''),
      study_recommended: new FormControl(null, Validators.required),
      pos: new FormControl(null, Validators.required),
      pos_reasons: new FormControl('', Validators.required),
      ef_assessment_comments: new FormControl('', Validators.required),
      research_questions: new FormControl('', Validators.required),
      potential_claims: new FormControl('', Validators.required),
      primary_endpoints: new FormControl('', Validators.required),
      secondary_endpoints: new FormControl('', Validators.required),
      estimated_study_start_date: new FormControl(null, Validators.required),
      estimated_study_end_date: new FormControl(null, Validators.required),
      estimated_sample_size: new FormControl('', Validators.required),
      total_estimated_budget: new FormControl('', Validators.required),
      // Enter Study Details (harmonizer) specific
      recommended: new FormControl(null, Validators.required),
      pilot: new FormControl(null, Validators.required), // Yes/No, same as Recommended
      budget_currency: new FormControl('', Validators.required),
      estimated_spend_plus_1: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d+(\.\d+)?$/),
      ]),
      estimated_spend_plus_2: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d+(\.\d+)?$/),
      ]),
      estimated_spend_plus_3: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d+(\.\d+)?$/),
      ]),
      study_details_pos: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d+(\.\d+)?$/),
      ]),
      regions_accepting_submissions: new FormControl(null, Validators.required),
    });
    this.setupStudyDetailsRecommendedListener();
  }

  /** When recommended or pilot is 'No', disable all other Enter Study Details fields; enable only when both are 'Yes'. */
  private studyDetailsControlNames = [
    'research_questions',
    'potential_claims',
    'primary_endpoints',
    'secondary_endpoints',
    'estimated_study_start_date',
    'estimated_study_end_date',
    'estimated_sample_size',
    'total_estimated_budget',
    'budget_currency',
    'estimated_spend_plus_1',
    'estimated_spend_plus_2',
    'estimated_spend_plus_3',
    'study_details_pos',
    'regions_accepting_submissions',
  ] as const;

  private applyStudyDetailsFieldsState() {
    const recommended = this.form.get('recommended')?.value ?? null;
    const isRecommendedYes = recommended === 'Yes';

    // Recommended Yes → enable all fields (including Pilot). Recommended No → disable all (including Pilot).
    const pilotControl = this.form.get('pilot');
    if (pilotControl) {
      if (isRecommendedYes) {
        pilotControl.enable({ emitEvent: false });
      } else {
        pilotControl.setValue('No', { emitEvent: false });
        pilotControl.disable({ emitEvent: false });
      }
    }

    this.studyDetailsControlNames.forEach((name) => {
      const control = this.form.get(name);
      if (control) {
        if (isRecommendedYes) {
          control.enable({ emitEvent: false });
        } else {
          control.disable({ emitEvent: false });
        }
      }
    });

    // Collapse Study Details accordion when recommended is No (section is disabled).
    if (!isRecommendedYes) {
      this.enterStudyDetailsSectionOpen = false;
    }
  }

  private setupStudyDetailsRecommendedListener() {
    this.form.get('recommended')?.valueChanges.subscribe(() => {
      this.applyStudyDetailsFieldsState();
    });
    this.applyStudyDetailsFieldsState();
  }

  private getIdeasByIdeaUid(ideaUid: string | null): {
    index: number;
    idea: Idea | null;
  } {
    if (!ideaUid) return { index: -1, idea: null };

    const index = this.ideas.findIndex((i) => i.idea_uid === ideaUid);
    const idea = index !== -1 ? this.ideas[index] : null;

    return { index, idea };
  }

  private patchForm(idea: Idea) {
    this.form.patchValue({
      pathway_id: idea.research_pathway?.pathway_name,
      rti_year: idea.rti_year,
      product_type: idea.product_type,
      product_id: idea.product?.product_name,

      brand_id: idea.brand?.brand_name,
      ta_id: idea.therapeutic_area?.ta_name,
      franchise_id: idea.franchise?.franchise_name,

      origin_request: idea.origin_request,
      strategic_rationale: idea.strategic_rationale,

      monadic_or_comparative: idea.monadic_or_comparative,
      target_aspirational_claim: idea.target_aspirational_claim,
      launch_claim: idea.launch_claim ? 'Yes' : 'No',
    });
  }

  getStatusColor(statusId: number | null | undefined): string {
    if (!statusId) return 'gray';

    // Harmonizer only: Harmonization Pending (5) = Product Prioritization Pending (10) color; Harmonized (10) = Product Ranked (12) color
    if (this.from === 'harmonizer') {
      if (statusId === 5) {
        const match = this.statusColor.find((s) => s.status_id === 10);
        return match ? match.color : 'gray';
      }
      if (statusId === 10) {
        const match = this.statusColor.find((s) => s.status_id === 12);
        return match ? match.color : 'gray';
      }
    }

    const match = this.statusColor.find((s) => s.status_id === statusId);
    return match ? match.color : 'gray';
  }

  private getDefaultStatusLabel(idea: Idea): string {
    if (!idea) {
      return '.....';
    }
    return idea.status?.status_name || '.....';
  }

  nextIdeaView() {
    if (this.index === -1 || !this.ideas.length) return;

    const nextIndex = this.index + 1;

    if (nextIndex < this.ideas.length) {
      const nextIdea = this.ideas[nextIndex];
      this.router.navigate(['/ideas/' + nextIdea.idea_uid]);
    }
  }

  prevIdeaView() {
    if (this.index === -1 || !this.ideas.length) return;

    const prevIndex = this.index - 1;

    if (prevIndex >= 0) {
      const prevIdea = this.ideas[prevIndex];
      this.router.navigate(['/ideas/' + prevIdea.idea_uid]);
    }
  }

  onAbandon() {
    this.popup.open = true;
  }

  onNeedMoreInfo() {
    this.needMoreInfoPopup.open = true;
  }

  onAssessIdea() {
    if (this.from === 'harmonizer') {
      this.enterStudyDetailsPopup.open = true;
      this.applyStudyDetailsFieldsState();
    } else {
      this.assessIdeaPopup.open = true;
    }
  }

  abandonIdea() {
    // TODO: integrate with backend
    this.popup.open = false;
  }

  needMoreInfo() {
    // TODO: integrate with backend
    this.needMoreInfoPopup.open = false;
  }

  assessIdea() {
    const studyRecommended = this.form.get('study_recommended');
    const pos = this.form.get('pos');
    const posReasons = this.form.get('pos_reasons');
    const efAssessmentComments = this.form.get('ef_assessment_comments');

    if (
      studyRecommended?.valid &&
      pos?.valid &&
      posReasons?.valid &&
      efAssessmentComments?.valid
    ) {
      this.assessIdeaPopup.open = false;
      this.submitToHarmonizationPopup.open = true;
    } else {
      studyRecommended?.markAsTouched();
      pos?.markAsTouched();
      posReasons?.markAsTouched();
      efAssessmentComments?.markAsTouched();
    }
  }

  submitToHarmonization() {
    // TODO: integrate with backend
    this.submitToHarmonizationPopup.open = false;
  }

  enterStudyDetails() {
    const recommended = this.form.get('recommended');
    if (!recommended?.valid) {
      recommended?.markAsTouched();
      return;
    }
    const isRecommendedYes = recommended.value === 'Yes';
    if (!isRecommendedYes) {
      this.submitStudyDetailsConfirmationPopup.open = true;
      return;
    }
    const pilot = this.form.get('pilot');
    if (!pilot?.valid) {
      pilot?.markAsTouched();
      return;
    }
    const studyDetailControls = [
      this.form.get('research_questions'),
      this.form.get('potential_claims'),
      this.form.get('primary_endpoints'),
      this.form.get('secondary_endpoints'),
      this.form.get('estimated_study_start_date'),
      this.form.get('estimated_study_end_date'),
      this.form.get('estimated_sample_size'),
      this.form.get('total_estimated_budget'),
      this.form.get('budget_currency'),
      this.form.get('estimated_spend_plus_1'),
      this.form.get('estimated_spend_plus_2'),
      this.form.get('estimated_spend_plus_3'),
      this.form.get('study_details_pos'),
      this.form.get('regions_accepting_submissions'),
    ];
    const allValid = studyDetailControls.every((c) => c?.valid);
    if (allValid) {
      this.submitStudyDetailsConfirmationPopup.open = true;
    } else {
      studyDetailControls.forEach((c) => c?.markAsTouched());
    }
  }

  submitStudyDetailsConfirmation() {
    if (!this.viewIdea?.idea_id) return;
    const payload = this.buildStudyDetailsPayload();
    if (!payload) return;
    this.ideaService.submitStudyDetails(payload).subscribe({
      next: () => {
        this.submitStudyDetailsConfirmationPopup.open = false;
        this.enterStudyDetailsPopup.open = false;
        this.store.dispatch(LoadIdeas());
        this.ideaService
          .putHarmonization(this.viewIdea!.idea_id, { updated_by: this.authService.getCurrentUserId() ?? 1 })
          .subscribe({
            next: (harmonizationRes) => {
              const message =
                (harmonizationRes as { message?: string })?.message ||
                'Idea harmonization completed successfully';
              this.ideaEvents.toastEvent(message);
              this.router.navigate(['/harmonizer']);
            },
            error: () => {},
          });
      },
      error: () => {
        this.submitStudyDetailsConfirmationPopup.open = false;
        this.enterStudyDetailsPopup.open = false;
      },
    });
  }

  /** Build payload for POST /study_details from form + current idea. */
  private buildStudyDetailsPayload(): StudyDetailsPayload | null {
    if (!this.viewIdea?.idea_id) return null;
    const raw = this.form.getRawValue();
    const toNum = (v: unknown): number => (v === '' || v == null ? 0 : Number(v));
    const toStr = (v: unknown): string => (v == null ? '' : String(v));
    const formatDate = (v: unknown): string => {
      if (v == null || v === '') return '';
      if (v instanceof Date) return v.toISOString().slice(0, 10);
      const s = String(v);
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
      return s;
    };
    const studyType = raw.pilot === 'Yes' ? 'Pilot' : 'Study';
    return {
      idea_id: this.viewIdea.idea_id,
      study_type: studyType,
      research_question: toStr(raw.research_questions),
      potential_claims: toStr(raw.potential_claims),
      primary_endpoints: toStr(raw.primary_endpoints),
      secondary_endpoints: toStr(raw.secondary_endpoints),
      estimated_start_date: formatDate(raw.estimated_study_start_date),
      estimated_end_date: formatDate(raw.estimated_study_end_date),
      estimated_sample_size: toNum(raw.estimated_sample_size),
      total_estimated_budget: toNum(raw.total_estimated_budget),
      budget_currency: toStr(raw.budget_currency),
      estimated_spend_plus_1: toNum(raw.estimated_spend_plus_1),
      estimated_spend_plus_2: toNum(raw.estimated_spend_plus_2),
      estimated_spend_plus_3: toNum(raw.estimated_spend_plus_3),
      pos: toNum(raw.study_details_pos),
      regions_accepting_submissions: toStr(raw.regions_accepting_submissions),
      created_by: this.authService.getCurrentUserId() ?? 1,
    };
  }

  hasStudyDetails(): boolean {
    const sd = this.viewIdea?.study_details;
    if (sd == null) return false;
    if (Array.isArray(sd)) return sd.length > 0;
    return typeof sd === 'object' && Object.keys(sd).length > 0;
  }

  hasPrioritizationOne(): boolean {
    const v = this.viewIdea?.ranking_brand;
    return v != null && String(v).trim() !== '';
  }

  hasPrioritizationTwo(): boolean {
    const v = this.viewIdea?.ranking_franchise;
    return v != null && String(v).trim() !== '';
  }

  toggleAccordion(panel: 'studyDetails' | 'prioritizationOne' | 'prioritizationTwo') {
    if (panel === 'studyDetails') this.accordionStudyDetailsOpen = !this.accordionStudyDetailsOpen;
    if (panel === 'prioritizationOne') this.accordionPrioritizationOneOpen = !this.accordionPrioritizationOneOpen;
    if (panel === 'prioritizationTwo') this.accordionPrioritizationTwoOpen = !this.accordionPrioritizationTwoOpen;
  }

  toggleEnterStudyDetailsSection(): void {
    this.enterStudyDetailsSectionOpen = !this.enterStudyDetailsSectionOpen;
  }

  onPilotToggle(checked: boolean): void {
    this.form.get('pilot')?.setValue(checked ? 'Yes' : 'No');
  }

  private studyDetailsLabelMap: Record<string, string> = {
    study_type: 'Study Type',
    study_id: 'Study ID',
    research_question: 'Research Question',
    potential_claims: 'Potential Claims',
    primary_endpoints: 'Primary Endpoints',
    secondary_endpoints: 'Secondary Endpoints',
    estimated_start_date: 'Estimated Start Date',
    estimated_end_date: 'Estimated End Date',
    estimated_sample_size: 'Estimated Sample Size',
    total_estimated_budget: 'Total Estimated Budget',
    budget_currency: 'Budget Currency',
    estimated_spend_plus_1: 'Estimated Spend +1',
    estimated_spend_plus_2: 'Estimated Spend +2',
    estimated_spend_plus_3: 'Estimated Spend +3',
    pos: 'POS',
    regions_accepting_submissions: 'Regions Accepting Submissions',
    status_id: 'Status ID',
    created_at: 'Created At',
    created_by: 'Created By',
    flag_soft_lock: 'Flag Soft Lock',
  };

  /** Get first study_details object from API (study_details is an array). */
  private getFirstStudyDetailsRecord(): Record<string, unknown> | null {
    const sd = this.viewIdea?.study_details;
    if (!sd) return null;
    if (Array.isArray(sd) && sd.length > 0 && typeof sd[0] === 'object' && sd[0] !== null) {
      return sd[0] as Record<string, unknown>;
    }
    if (typeof sd === 'object' && !Array.isArray(sd)) return sd as Record<string, unknown>;
    return null;
  }

  getStudyDetailsDisplayRows(): { label: string; value: string }[] {
    const record = this.getFirstStudyDetailsRecord();
    if (!record) return [];
    return Object.entries(record).map(([key, val]) => ({
      label: this.studyDetailsLabelMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value: val != null ? String(val) : '.....',
    }));
  }

  navigateToEdit() {
    if (!this.viewIdea) return;
    if (this.overlayMode) {
      this.editDetails.emit(this.viewIdea);
    } else {
      this.router.navigate(['/ideas/' + this.viewIdea.idea_uid + '/edit'], {
        queryParams: {
          from: this.referrer || undefined,
          statusLabel: this.statusLabel !== '.....' ? this.statusLabel : undefined,
        },
      });
    }
  }
}

