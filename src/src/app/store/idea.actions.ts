import { createAction, props } from '@ngrx/store';
import { Idea, IdeaPayload } from '../models/idea.model';
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
