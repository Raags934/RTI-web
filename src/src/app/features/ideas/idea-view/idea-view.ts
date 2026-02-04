import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
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
    private router: Router
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
              research_questions: '',
              potential_claims: '',
              primary_endpoints: '',
              secondary_endpoints: '',
              estimated_study_start_date: null,
              estimated_study_end_date: null,
              estimated_sample_size: '',
              total_estimated_budget: '',
            });
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
        this.from = this.referrer || '';
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
    });
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
    const researchQuestions = this.form.get('research_questions');
    const potentialClaims = this.form.get('potential_claims');
    const primaryEndpoints = this.form.get('primary_endpoints');
    const secondaryEndpoints = this.form.get('secondary_endpoints');
    const estimatedStudyStartDate = this.form.get('estimated_study_start_date');
    const estimatedStudyEndDate = this.form.get('estimated_study_end_date');
    const estimatedSampleSize = this.form.get('estimated_sample_size');
    const totalEstimatedBudget = this.form.get('total_estimated_budget');

    if (
      researchQuestions?.valid &&
      potentialClaims?.valid &&
      primaryEndpoints?.valid &&
      secondaryEndpoints?.valid &&
      estimatedStudyStartDate?.valid &&
      estimatedStudyEndDate?.valid &&
      estimatedSampleSize?.valid &&
      totalEstimatedBudget?.valid
    ) {
      this.submitStudyDetailsConfirmationPopup.open = true;
    } else {
      researchQuestions?.markAsTouched();
      potentialClaims?.markAsTouched();
      primaryEndpoints?.markAsTouched();
      secondaryEndpoints?.markAsTouched();
      estimatedStudyStartDate?.markAsTouched();
      estimatedStudyEndDate?.markAsTouched();
      estimatedSampleSize?.markAsTouched();
      totalEstimatedBudget?.markAsTouched();
    }
  }

  submitStudyDetailsConfirmation() {
    // TODO: integrate with backend
    this.submitStudyDetailsConfirmationPopup.open = true;
    this.enterStudyDetailsPopup.open = false;
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

