import { createReducer, on } from '@ngrx/store';
import { Idea } from '../models/idea.model';
import {
  AddIdea,
  AddIdeaSuccess,
  AddIdeaFailure,
  LoadIdeas,
  LoadIdeasSuccess,
  loadIdeasFailure,
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
  })
);
