import { Idea } from './models/idea.model';
import { MasterDataState } from './store/masterData/masterData.reducer';

export interface AppState {
  readonly ideas: Idea[];
  readonly masterData: MasterDataState;
}
