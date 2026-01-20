import { createAction, props } from '@ngrx/store';
import { MasterDataResponse } from '../../models/api-response/masterData.model';

export const loadMasterData = createAction(
  '[MasterData] Load Master Data',
  props<{ email: string }>()
);

export const loadMasterDataSuccess = createAction(
  '[MasterData] Load Master Data Success',
  props<{ data: MasterDataResponse }>()
);

export const loadMasterDataFailure = createAction(
  '[MasterData] Load Master Data Failure',
  props<{ error: any }>()
);
