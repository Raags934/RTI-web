import { createReducer, on } from '@ngrx/store';
import * as MasterDataActions from './masterData.actions.js'
import { MasterDataResponse } from '../../models/api-response/masterData.model';

export interface MasterDataState {
  data: MasterDataResponse | null;
  loading: boolean;
  error: any;
}

export const initialState: MasterDataState = {
  data: null,
  loading: false,
  error: null
};

export const masterDataReducer = createReducer(
  initialState,

  on(MasterDataActions.loadMasterData, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(MasterDataActions.loadMasterDataSuccess, (state, { data }) => ({
    ...state,
    loading: false,
    data
  })),

  on(MasterDataActions.loadMasterDataFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);
