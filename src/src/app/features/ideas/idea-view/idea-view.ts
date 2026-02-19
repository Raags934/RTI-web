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
import { StudyDetailsPayload, StudyDetailsWithPilotPayload } from '../../../models/study-details.model';
import { Buttons } from '../../../shared/components/buttons/buttons';
import { statusColor } from '../../../shared/constants/statusColor';
import { IdeaEventsService } from '../../../events/ideaServiceEvents';
import { Popup, PopupConfigs } from '../../../shared/constants/popUp';
import { PopUp } from '../../../shared/components/popup/popup';

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

  /** Options for Proposed Study Design dropdown. */
  proposedStudyDesignOptions = [
    { id: 'monadic', name: 'Monadic' },
    { id: 'comparative', name: 'Comparative' },
    { id: 'controlled', name: 'Controlled' },
    { id: 'masked', name: 'Masked' },
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

  /** Accordion open state for View Idea Details (Study Details, Pilot Details, Prioritization 1 & 2). */
  accordionStudyDetailsOpen = false;
  accordionPilotDetailsOpen = false;
  accordionPrioritizationOneOpen = false;
  accordionPrioritizationTwoOpen = false;

  /** Accordion open state for Enter Study Details popup form (Study Details section). */
  enterStudyDetailsSectionOpen = true;
  /** Accordion open state for Pilot Details section. */
  pilotDetailsSectionOpen = false;

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
    private cdr: ChangeDetectorRef
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
              other_potential_endpoints: '',
              proposed_study_design: null,
              proposed_statistics: '',
              estimated_study_start_date: null,
              estimated_study_end_date: null,
              estimated_sample_size: '',
              total_estimated_budget: '',
              budget_currency: '',
              estimated_spend_plus_1: '',
              estimated_spend_plus_2: '',
              estimated_spend_plus_3: '',
              study_details_pos: '',
              study_details_pos_reasons: '',
              regions_accepting_submissions: null,
              pilot_research_questions: '',
              pilot_potential_claims: '',
              pilot_primary_endpoints: '',
              pilot_secondary_endpoints: '',
              pilot_other_potential_endpoints: '',
              pilot_proposed_study_design: null,
              pilot_proposed_statistics: '',
              pilot_estimated_study_start_date: null,
              pilot_estimated_study_end_date: null,
              pilot_estimated_sample_size: '',
              pilot_total_estimated_budget: '',
              pilot_budget_currency: '',
              pilot_estimated_spend_plus_1: '',
              pilot_estimated_spend_plus_2: '',
              pilot_estimated_spend_plus_3: '',
              pilot_regions_accepting_submissions: null,
            });
            this.pilotDetailsSectionOpen = false;
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
      other_potential_endpoints: new FormControl('', Validators.required),
      proposed_study_design: new FormControl(null, Validators.required),
      proposed_statistics: new FormControl('', Validators.required),
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
      study_details_pos_reasons: new FormControl('', Validators.required),
      regions_accepting_submissions: new FormControl(null, Validators.required),
      // Pilot Details fields (same as Study Details)
      pilot_research_questions: new FormControl('', Validators.required),
      pilot_potential_claims: new FormControl('', Validators.required),
      pilot_primary_endpoints: new FormControl('', Validators.required),
      pilot_secondary_endpoints: new FormControl('', Validators.required),
      pilot_other_potential_endpoints: new FormControl('', Validators.required),
      pilot_proposed_study_design: new FormControl(null, Validators.required),
      pilot_proposed_statistics: new FormControl('', Validators.required),
      pilot_estimated_study_start_date: new FormControl(null, Validators.required),
      pilot_estimated_study_end_date: new FormControl(null, Validators.required),
      pilot_estimated_sample_size: new FormControl('', Validators.required),
      pilot_total_estimated_budget: new FormControl('', Validators.required),
      pilot_budget_currency: new FormControl('', Validators.required),
      pilot_estimated_spend_plus_1: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d+(\.\d+)?$/),
      ]),
      pilot_estimated_spend_plus_2: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d+(\.\d+)?$/),
      ]),
      pilot_estimated_spend_plus_3: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d+(\.\d+)?$/),
      ]),
      pilot_regions_accepting_submissions: new FormControl(null, Validators.required),
    });
    this.setupStudyDetailsRecommendedListener();
  }

  /** When recommended or pilot is 'No', disable all other Enter Study Details fields; enable only when both are 'Yes'. */
  private studyDetailsControlNames = [
    'research_questions',
    'potential_claims',
    'primary_endpoints',
    'secondary_endpoints',
    'other_potential_endpoints',
    'proposed_study_design',
    'proposed_statistics',
    'estimated_study_start_date',
    'estimated_study_end_date',
    'estimated_sample_size',
    'total_estimated_budget',
    'budget_currency',
    'estimated_spend_plus_1',
    'estimated_spend_plus_2',
    'estimated_spend_plus_3',
    'study_details_pos',
    'study_details_pos_reasons',
    'regions_accepting_submissions',
  ] as const;

  private pilotDetailsControlNames = [
    'pilot_research_questions',
    'pilot_potential_claims',
    'pilot_primary_endpoints',
    'pilot_secondary_endpoints',
    'pilot_other_potential_endpoints',
    'pilot_proposed_study_design',
    'pilot_proposed_statistics',
    'pilot_estimated_study_start_date',
    'pilot_estimated_study_end_date',
    'pilot_estimated_sample_size',
    'pilot_total_estimated_budget',
    'pilot_budget_currency',
    'pilot_estimated_spend_plus_1',
    'pilot_estimated_spend_plus_2',
    'pilot_estimated_spend_plus_3',
    'pilot_regions_accepting_submissions',
  ] as const;

  private applyStudyDetailsFieldsState() {
    const recommended = this.form.get('recommended')?.value ?? null;
    const isRecommendedYes = recommended === 'Yes';
    const pilot = this.form.get('pilot')?.value ?? null;
    const isPilotYes = pilot === 'Yes';

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

    // Study Details fields: enabled when recommended is Yes
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

    // Pilot Details fields: enabled when recommended is Yes AND pilot is Yes
    this.pilotDetailsControlNames.forEach((name) => {
      const control = this.form.get(name);
      if (control) {
        if (isRecommendedYes && isPilotYes) {
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

    // Collapse Pilot Details accordion when pilot is No or recommended is No
    if (!isRecommendedYes || !isPilotYes) {
      this.pilotDetailsSectionOpen = false;
    }
  }

  private setupStudyDetailsRecommendedListener() {
    this.form.get('recommended')?.valueChanges.subscribe(() => {
      this.applyStudyDetailsFieldsState();
    });
    this.form.get('pilot')?.valueChanges.subscribe(() => {
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

    // Harmonizer only: Harmonization Pending (18) = Product Prioritization Pending (10) color; Harmonized (10) = Product Ranked (12) color
    if (this.from === 'harmonizer') {
      if (statusId === 18) {
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
      this.form.get('other_potential_endpoints'),
      this.form.get('proposed_study_design'),
      this.form.get('proposed_statistics'),
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
    const isPilotYes = pilot.value === 'Yes';
    const controlsToValidate = isPilotYes
      ? [
          ...studyDetailControls,
          ...this.pilotDetailsControlNames.map((name) => this.form.get(name)),
        ]
      : studyDetailControls;
    const allValid = controlsToValidate.every((c) => c?.valid);
    if (allValid) {
      this.submitStudyDetailsConfirmationPopup.open = true;
    } else {
      controlsToValidate.forEach((c) => c?.markAsTouched());
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
          .putHarmonization(this.viewIdea!.idea_id, { updated_by: 3 })
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

  /** Build payload for POST /study_details from form + current idea. When Pilot Study is Yes, includes pilot details. */
  private buildStudyDetailsPayload(): StudyDetailsPayload | StudyDetailsWithPilotPayload | null {
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
    const isPilotYes = raw.pilot === 'Yes';

    if (isPilotYes) {
      return {
        idea_id: this.viewIdea.idea_id,
        pos_reasons: toStr(raw.study_details_pos_reasons),
        research_question: toStr(raw.research_questions),
        potential_claims: toStr(raw.potential_claims),
        primary_endpoints: toStr(raw.primary_endpoints),
        secondary_endpoints: toStr(raw.secondary_endpoints),
        other_potential_endpoints: toStr(raw.other_potential_endpoints),
        proposed_study_design: toStr(raw.proposed_study_design),
        proposed_statistics: toStr(raw.proposed_statistics),
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
        pilot_research_question: toStr(raw.pilot_research_questions),
        pilot_potential_claims: toStr(raw.pilot_potential_claims),
        pilot_primary_endpoints: toStr(raw.pilot_primary_endpoints),
        pilot_secondary_endpoints: toStr(raw.pilot_secondary_endpoints),
        pilot_other_potential_endpoints: toStr(raw.pilot_other_potential_endpoints),
        pilot_proposed_study_design: toStr(raw.pilot_proposed_study_design),
        pilot_proposed_statistics: toStr(raw.pilot_proposed_statistics),
        pilot_estimated_start_date: formatDate(raw.pilot_estimated_study_start_date),
        pilot_estimated_end_date: formatDate(raw.pilot_estimated_study_end_date),
        pilot_estimated_sample_size: toNum(raw.pilot_estimated_sample_size),
        pilot_total_estimated_budget: toNum(raw.pilot_total_estimated_budget),
        pilot_budget_currency: toStr(raw.pilot_budget_currency),
        pilot_estimated_spend_plus_1: toNum(raw.pilot_estimated_spend_plus_1),
        pilot_estimated_spend_plus_2: toNum(raw.pilot_estimated_spend_plus_2),
        pilot_estimated_spend_plus_3: toNum(raw.pilot_estimated_spend_plus_3),
        pilot_regions_accepting_submissions: toStr(raw.pilot_regions_accepting_submissions),
        created_by: 1, // TODO: replace with current user when auth is integrated
        comment: '',
      } as StudyDetailsWithPilotPayload;
    }

    return {
      idea_id: this.viewIdea.idea_id,
      research_question: toStr(raw.research_questions),
      potential_claims: toStr(raw.potential_claims),
      primary_endpoints: toStr(raw.primary_endpoints),
      secondary_endpoints: toStr(raw.secondary_endpoints),
      other_potential_endpoints: toStr(raw.other_potential_endpoints),
      proposed_study_design: toStr(raw.proposed_study_design),
      proposed_statistics: toStr(raw.proposed_statistics),
      estimated_start_date: formatDate(raw.estimated_study_start_date),
      estimated_end_date: formatDate(raw.estimated_study_end_date),
      estimated_sample_size: toNum(raw.estimated_sample_size),
      total_estimated_budget: toNum(raw.total_estimated_budget),
      budget_currency: toStr(raw.budget_currency),
      estimated_spend_plus_1: toNum(raw.estimated_spend_plus_1),
      estimated_spend_plus_2: toNum(raw.estimated_spend_plus_2),
      estimated_spend_plus_3: toNum(raw.estimated_spend_plus_3),
      pos: toNum(raw.study_details_pos),
      pos_reasons: toStr(raw.study_details_pos_reasons),
      regions_accepting_submissions: toStr(raw.regions_accepting_submissions),
      created_by: 1, // TODO: replace with current user when auth is integrated
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

  toggleAccordion(panel: 'studyDetails' | 'pilotDetails' | 'prioritizationOne' | 'prioritizationTwo') {
    if (panel === 'studyDetails') this.accordionStudyDetailsOpen = !this.accordionStudyDetailsOpen;
    if (panel === 'pilotDetails') this.accordionPilotDetailsOpen = !this.accordionPilotDetailsOpen;
    if (panel === 'prioritizationOne') this.accordionPrioritizationOneOpen = !this.accordionPrioritizationOneOpen;
    if (panel === 'prioritizationTwo') this.accordionPrioritizationTwoOpen = !this.accordionPrioritizationTwoOpen;
  }

  toggleEnterStudyDetailsSection(): void {
    this.enterStudyDetailsSectionOpen = !this.enterStudyDetailsSectionOpen;
  }

  togglePilotDetailsSection(): void {
    this.pilotDetailsSectionOpen = !this.pilotDetailsSectionOpen;
  }

  onPilotToggle(checked: boolean): void {
    this.form.get('pilot')?.setValue(checked ? 'Yes' : 'No');
    if (!checked) {
      this.pilotDetailsSectionOpen = false;
    }
    // Update field states when pilot changes
    this.applyStudyDetailsFieldsState();
  }

  cancelStudyDetails(): void {
    this.enterStudyDetailsPopup.open = false;
    // Reset form fields when cancelled
    if (this.from === 'harmonizer') {
      this.form.patchValue({
        recommended: null,
        pilot: null,
        research_questions: '',
        potential_claims: '',
        primary_endpoints: '',
        secondary_endpoints: '',
        other_potential_endpoints: '',
        proposed_study_design: null,
        proposed_statistics: '',
        estimated_study_start_date: null,
        estimated_study_end_date: null,
        estimated_sample_size: '',
        total_estimated_budget: '',
        budget_currency: '',
        estimated_spend_plus_1: '',
        estimated_spend_plus_2: '',
        estimated_spend_plus_3: '',
        study_details_pos: '',
        study_details_pos_reasons: '',
        regions_accepting_submissions: null,
        pilot_research_questions: '',
        pilot_potential_claims: '',
        pilot_primary_endpoints: '',
        pilot_secondary_endpoints: '',
        pilot_other_potential_endpoints: '',
        pilot_proposed_study_design: null,
        pilot_proposed_statistics: '',
        pilot_estimated_study_start_date: null,
        pilot_estimated_study_end_date: null,
        pilot_estimated_sample_size: '',
        pilot_total_estimated_budget: '',
        pilot_budget_currency: '',
        pilot_estimated_spend_plus_1: '',
        pilot_estimated_spend_plus_2: '',
        pilot_estimated_spend_plus_3: '',
        pilot_regions_accepting_submissions: null,
      });
    }
  }

  saveStudyDetailsDraft(): void {
    // Save as draft functionality - same as submit but mark as draft
    // For now, just close the popup (can be extended later if draft API is needed)
    this.enterStudyDetailsPopup.open = false;
  }

  private studyDetailsLabelMap: Record<string, string> = {
    study_type: 'Study Type',
    study_id: 'Study ID',
    research_question: 'Research Question',
    potential_claims: 'Potential Claims',
    primary_endpoints: 'Primary Endpoints',
    secondary_endpoints: 'Secondary Endpoints',
    other_potential_endpoints: 'Other Potential Endpoints',
    proposed_study_design: 'Proposed Study Design',
    proposed_statistics: 'Proposed Statistics',
    estimated_start_date: 'Estimated Start Date',
    estimated_end_date: 'Estimated End Date',
    estimated_sample_size: 'Estimated Sample Size',
    total_estimated_budget: 'Total Estimated Budget',
    budget_currency: 'Budget Currency',
    estimated_spend_plus_1: 'Estimated Spend +1',
    estimated_spend_plus_2: 'Estimated Spend +2',
    estimated_spend_plus_3: 'Estimated Spend +3',
    pos: 'POS',
    pos_reasons: 'Pos Reasons',
    regions_accepting_submissions: 'Regions Accepting Submissions',
    status_id: 'Status ID',
    created_at: 'Created At',
    created_by: 'Created By',
    updated_at: 'Updated At',
    updated_by: 'Updated By',
    flag_soft_lock: 'Flag Soft Lock',
  };

  /**
   * Canonical display order for Study Details accordion (Budget Currency first).
   * Pilot Details accordion uses the same order so positions match (Pilot Budget Currency first, etc.).
   */
  private studyDetailsDisplayOrder: string[] = [
    'budget_currency',
    'research_question',
    'potential_claims',
    'primary_endpoints',
    'secondary_endpoints',
    'other_potential_endpoints',
    'proposed_study_design',
    'proposed_statistics',
    'estimated_start_date',
    'estimated_end_date',
    'estimated_sample_size',
    'total_estimated_budget',
    'estimated_spend_plus_1',
    'estimated_spend_plus_2',
    'estimated_spend_plus_3',
    'pos',
    'pos_reasons',
    'regions_accepting_submissions',
    'created_at',
    'created_by',
    'updated_at',
    'updated_by',
  ];

  /** Study key -> pilot key for same-position display in Pilot Details accordion. */
  private studyKeyToPilotKey: Record<string, string> = {
    budget_currency: 'pilot_budget_currency',
    research_question: 'pilot_research_question',
    potential_claims: 'pilot_potential_claims',
    primary_endpoints: 'pilot_primary_endpoints',
    secondary_endpoints: 'pilot_secondary_endpoints',
    other_potential_endpoints: 'pilot_other_potential_endpoints',
    proposed_study_design: 'pilot_proposed_study_design',
    proposed_statistics: 'pilot_proposed_statistics',
    estimated_start_date: 'pilot_estimated_start_date',
    estimated_end_date: 'pilot_estimated_end_date',
    estimated_sample_size: 'pilot_estimated_sample_size',
    total_estimated_budget: 'pilot_total_estimated_budget',
    estimated_spend_plus_1: 'pilot_estimated_spend_plus_1',
    estimated_spend_plus_2: 'pilot_estimated_spend_plus_2',
    estimated_spend_plus_3: 'pilot_estimated_spend_plus_3',
    regions_accepting_submissions: 'pilot_regions_accepting_submissions',
  };

  /** Pilot-only keys (study-details.model.ts); used for hasPilotDetails(). */
  private pilotDetailKeys = [
    'pilot_research_question',
    'pilot_potential_claims',
    'pilot_primary_endpoints',
    'pilot_secondary_endpoints',
    'pilot_other_potential_endpoints',
    'pilot_proposed_study_design',
    'pilot_proposed_statistics',
    'pilot_estimated_start_date',
    'pilot_estimated_end_date',
    'pilot_estimated_sample_size',
    'pilot_total_estimated_budget',
    'pilot_budget_currency',
    'pilot_estimated_spend_plus_1',
    'pilot_estimated_spend_plus_2',
    'pilot_estimated_spend_plus_3',
    'pilot_regions_accepting_submissions',
  ] as const;

  private pilotDetailsLabelMap: Record<string, string> = {
    pilot_research_question: 'Pilot Research Question',
    pilot_potential_claims: 'Pilot Potential Claims',
    pilot_primary_endpoints: 'Pilot Primary Endpoints',
    pilot_secondary_endpoints: 'Pilot Secondary Endpoints',
    pilot_other_potential_endpoints: 'Pilot Other Potential Endpoints',
    pilot_proposed_study_design: 'Pilot Proposed Study Design',
    pilot_proposed_statistics: 'Pilot Proposed Statistics',
    pilot_estimated_start_date: 'Pilot Estimated Start Date',
    pilot_estimated_end_date: 'Pilot Estimated End Date',
    pilot_estimated_sample_size: 'Pilot Estimated Sample Size',
    pilot_total_estimated_budget: 'Pilot Total Estimated Budget',
    pilot_budget_currency: 'Pilot Budget Currency',
    pilot_estimated_spend_plus_1: 'Pilot Estimated Spend +1',
    pilot_estimated_spend_plus_2: 'Pilot Estimated Spend +2',
    pilot_estimated_spend_plus_3: 'Pilot Estimated Spend +3',
    pilot_regions_accepting_submissions: 'Pilot Regions Accepting Submissions',
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

  /** Keys hidden from Study Details accordion (not shown to user). */
  private studyDetailsHiddenKeys = new Set(['study_id', 'status_id', 'flag_soft_lock', 'study_type']);

  getStudyDetailsDisplayRows(): { label: string; value: string }[] {
    const record = this.getFirstStudyDetailsRecord();
    if (!record) return [];
    const rows: { label: string; value: string }[] = [];
    const seen = new Set<string>();
    for (const key of this.studyDetailsDisplayOrder) {
      if (key.startsWith('pilot_') || this.studyDetailsHiddenKeys.has(key)) continue;
      if (record[key] !== undefined) {
        seen.add(key);
        rows.push({
          label: this.studyDetailsLabelMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          value: record[key] != null ? String(record[key]) : '.....',
        });
      }
    }
    for (const key of Object.keys(record)) {
      if (key.startsWith('pilot_') || seen.has(key) || this.studyDetailsHiddenKeys.has(key)) continue;
      rows.push({
        label: this.studyDetailsLabelMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        value: record[key] != null ? String(record[key]) : '.....',
      });
    }
    return rows;
  }

  /** True when study_details has any pilot_ field with a value. */
  hasPilotDetails(): boolean {
    const record = this.getFirstStudyDetailsRecord();
    if (!record) return false;
    return this.pilotDetailKeys.some((key) => {
      const val = record[key];
      return val != null && String(val).trim() !== '';
    });
  }

  getPilotDetailsDisplayRows(): { label: string; value: string }[] {
    const record = this.getFirstStudyDetailsRecord();
    if (!record) return [];
    const rows: { label: string; value: string }[] = [];
    // Same order as Study Details: Pilot Budget Currency first, then same positions throughout
    for (const studyKey of this.studyDetailsDisplayOrder) {
      // Skip pilot_ prefixed keys and hidden keys
      if (studyKey.startsWith('pilot_') || this.studyDetailsHiddenKeys.has(studyKey)) continue;
      
      const pilotKey = this.studyKeyToPilotKey[studyKey];
      if (pilotKey !== undefined) {
        // Show pilot field if it exists in record (even if null, show '.....')
        rows.push({
          label: this.pilotDetailsLabelMap[pilotKey] || pilotKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          value: record[pilotKey] != null ? String(record[pilotKey]) : '.....',
        });
      } else {
        // For fields without pilot versions (pos, pos_reasons, created_at, created_by, updated_at, updated_by)
        // Show the study version to maintain sync, but only if the field exists in the record
        if (['pos', 'pos_reasons', 'created_at', 'created_by', 'updated_at', 'updated_by'].includes(studyKey)) {
          rows.push({
            label: this.studyDetailsLabelMap[studyKey] || studyKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            value: record[studyKey] != null ? String(record[studyKey]) : '.....',
          });
        }
      }
    }
    return rows;
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

  onCancel() {
    // Redirect to harmonizer landing page when Cancel is clicked
    if (this.from === 'harmonizer') {
      this.router.navigate(['/harmonizer']);
    }
  }

  /**
   * Check if Edit Details button should be hidden.
   * Hide when idea is harmonized (status_id === 10 or statusLabel contains "Harmonized").
   * Show when idea is harmonization pending (status_id === 18 or statusLabel === "Harmonization pending").
   */
  shouldHideEditDetails(): boolean {
    // Only apply this logic when coming from harmonizer
    if (this.from !== 'harmonizer') {
      return false;
    }

    // Show if status_id is 18 (Harmonization Pending)
    if (this.viewIdea?.status_id === 18) {
      return false;
    }

    // Hide if status_id is 10 (Harmonized)
    if (this.viewIdea?.status_id === 10) {
      return true;
    }

    // Check statusLabel - show if it's "Harmonization pending"
    if (this.statusLabel && this.statusLabel.toLowerCase().includes('harmonization pending')) {
      return false;
    }

    // Hide if statusLabel contains "Harmonized" (e.g., "Harmonized Data")
    if (this.statusLabel && this.statusLabel.toLowerCase().includes('harmonized')) {
      return true;
    }

    return false;
  }
}

