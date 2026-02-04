import { createReducer, on } from '@ngrx/store';
import { Idea } from '../models/idea.model';
import {
  AddIdea,
  AddIdeaSuccess,
  AddIdeaFailure,
  AddDraftIdea,
  AddDraftIdeaSuccess,
  AddDraftIdeaFailure,
  LoadIdeas,
  LoadIdeasSuccess,
  loadIdeasFailure,
  SavePrioritization,
  SavePrioritizationSuccess,
  SavePrioritizationFailure,
  SubmitPrioritization,
  SubmitPrioritizationSuccess,
  SubmitPrioritizationFailure,
  DeleteIdea,
  DeleteIdeaSuccess,
  DeleteIdeaFailure,
  UpdateIdea,
  UpdateIdeaSuccess,
  UpdateIdeaFailure,
} from './idea.actions';

export const initialState: Idea[] = [];

export const ideaReducer = createReducer(
  initialState,
  on(LoadIdeas, (state) => {
    return state;
  }),
  on(LoadIdeasSuccess, (state, { ideas }) => {
    return [...ideas];
  }),
  on(loadIdeasFailure, (state, { error }) => {
    console.error('Error loading ideas:', error);
    return state;
  }),
  on(AddIdea, (state) => {
    return state;
  }),
  on(AddIdeaSuccess, (state, { idea }) => {
    return [idea,...state];
  }),
  on(AddIdeaFailure, (state, { error }) => {
    console.error('Error adding idea:', error);
    return state;
  }),
  on(AddDraftIdea, (state) => {
    return state;
  }),
  on(AddDraftIdeaSuccess, (state, { idea }) => {
    return [idea, ...state];
  }),
  on(AddDraftIdeaFailure, (state, { error }) => {
    console.error('Error adding draft idea:', error);
    return state;
  }),
  on(SavePrioritization, (state) => {
    return state;
  }),
  on(SavePrioritizationSuccess, (state, { ideas }) => {
    return [...ideas];
  }),
  on(SavePrioritizationFailure, (state, { error }) => {
    console.error('Error saving prioritization:', error);
    return state;
  }),
  on(SubmitPrioritization, (state) => {
    return state;
  }),
  on(SubmitPrioritizationSuccess, (state, { ideas }) => {
    return [...ideas];
  }),
  on(SubmitPrioritizationFailure, (state, { error }) => {
    console.error('Error submitting prioritization:', error);
    return state;
  }),
  on(DeleteIdea, (state) => {
    return state;
  }),
  on(DeleteIdeaSuccess, (state, { ideaId }) => {
    return state.filter((idea) => idea.idea_id !== ideaId);
  }),
  on(DeleteIdeaFailure, (state, { error }) => {
    console.error('Error deleting idea:', error);
    return state;
  }),
  on(UpdateIdea, (state) => {
    return state;
  }),
  on(UpdateIdeaSuccess, (state, { idea }) => {
    // Only update if we have a complete idea object with idea_uid
    if (idea && idea.idea_uid) {
      return state.map((i) => (i.idea_id === idea.idea_id ? idea : i));
    }
    // If incomplete, return state as-is (LoadIdeasSuccess will handle full update)
    return state;
  }),
  on(UpdateIdeaFailure, (state, { error }) => {
    console.error('Error updating idea:', error);
    return state;
  })
);
