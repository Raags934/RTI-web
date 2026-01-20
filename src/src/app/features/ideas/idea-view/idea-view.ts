import { Component, OnInit } from '@angular/core';
import { FormInput } from '../../../shared/components/form-input/form-input';
import { VIEW_IDEA_FORM_LABELS } from '../../../shared/constants/labels';

import { Observable, Subscription } from 'rxjs';
import { Idea } from '../../../models/idea.model';

import { AppState } from '../../../app.state.js';
import { Store, select } from '@ngrx/store';

import { ActivatedRoute, Router } from '@angular/router';

import { take } from 'rxjs/operators';
import { LoadIdeas } from '../../../store/idea.actions';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { Buttons } from '../../../shared/components/buttons/buttons';
import { statusColor } from '../../../shared/constants/statusColor';
import { IdeaEventsService } from '../../../events/ideaServiceEvents';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-idea-view',
  imports: [FormInput, Buttons],
  templateUrl: './idea-view.html',
  styleUrl: './idea-view.scss',
})
export class IdeaView implements OnInit {
  labels = VIEW_IDEA_FORM_LABELS;

  form!: FormGroup;

  ideas$: Observable<Idea[]>;
  ideas: Idea[] = [];

  viewIdea: Idea | null = null;
  index: number = -1;
  statusColor = statusColor;

  private sub!: Subscription;

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
      }
    });
  }

  ngOnInit(): void {
    this.buildForm();

    // Load ideas if empty
    this.ideas$.pipe(take(1)).subscribe((ideas) => {
      if (!ideas.length) this.store.dispatch(LoadIdeas());
    });

    // Combine route params + ideas stream
    combineLatest([this.route.paramMap, this.ideas$]).subscribe(([params, ideas]) => {
      this.ideas = ideas;

      const ideaUid = params.get('idea_uid');
      const { index, idea } = this.getIdeasByIdeaUid(ideaUid);

      this.index = index;
      this.viewIdea = idea;

      if (this.viewIdea) {
        this.patchForm(this.viewIdea);
      }
    });
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

  getIdeasByIdeaUid(ideaUid: string | null): { index: number; idea: Idea | null } {
    if (!ideaUid) return { index: -1, idea: null };

    const index = this.ideas.findIndex((i) => i.idea_uid === ideaUid);
    const idea = index !== -1 ? this.ideas[index] : null;

    return { index, idea };
  }

  patchForm(idea: Idea) {
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
    if (!statusId) return 'gray'; // fallback color

    const match = this.statusColor.find((s) => s.status_id === statusId);
    return match ? match.color : 'gray';
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
}
