import { createAction, props } from '@ngrx/store';
import { Idea, IdeaPayload } from '../models/idea.model';
import { PrioritizationPayload } from '../models/prioritization.model';
import { MasterDataResponse } from '../models/api-response/masterData.model';

export const LoadIdeas = createAction('[Idea] Load Ideas');

export const LoadIdeasSuccess = createAction(
  '[Idea] Load Ideas Success',
  props<{ ideas: Idea[] }>()
);

export const loadIdeasFailure = createAction(
  '[Idea] Load Ideas Failure',
  props<{ error: string }>()
);

export const AddIdea = createAction('[Idea] Add Idea', props<{ idea: IdeaPayload }>());

export const AddIdeaSuccess = createAction('[Idea] Add Idea Success', props<{ idea: Idea }>());

export const AddIdeaFailure = createAction('[Idea] Add Idea Failure', props<{ error: string }>());

export const AddDraftIdea = createAction('[Idea] Add Draft Idea', props<{ idea: IdeaPayload }>());

export const AddDraftIdeaSuccess = createAction('[Idea] Add Draft Idea Success', props<{ idea: Idea }>());

export const AddDraftIdeaFailure = createAction('[Idea] Add Draft Idea Failure', props<{ error: string }>());

export const SavePrioritization = createAction(
  '[Idea] Save Prioritization',
  props<{ payload: PrioritizationPayload; url: string }>()
);

export const SavePrioritizationSuccess = createAction(
  '[Idea] Save Prioritization Success',
  props<{ ideas: Idea[] }>()
);

export const SavePrioritizationFailure = createAction(
  '[Idea] Save Prioritization Failure',
  props<{ error: string }>()
);

export const SubmitPrioritization = createAction(
  '[Idea] Submit Prioritization',
  props<{ payload: PrioritizationPayload; url: string }>()
);

export const SubmitPrioritizationSuccess = createAction(
  '[Idea] Submit Prioritization Success',
  props<{ ideas: Idea[] }>()
);

export const SubmitPrioritizationFailure = createAction(
  '[Idea] Submit Prioritization Failure',
  props<{ error: string }>()
);

export const DeleteIdea = createAction('[Idea] Delete Idea', props<{ ideaId: number }>());

export const DeleteIdeaSuccess = createAction('[Idea] Delete Idea Success', props<{ ideaId: number }>());

export const DeleteIdeaFailure = createAction('[Idea] Delete Idea Failure', props<{ error: string }>());
