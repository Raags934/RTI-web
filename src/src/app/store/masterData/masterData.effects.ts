import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { MasterDataService } from './masterData.service';
import * as masterDataActions from './masterData.actions';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class MasterDataEffects {
  loadMasterData$;

  constructor(
    private actions$: Actions,
    private service: MasterDataService
  ) {
    this.loadMasterData$ = createEffect(() =>
      this.actions$.pipe(
        ofType(masterDataActions.loadMasterData),
        mergeMap(({ email }) =>
          this.service.getMasterDataByEmail(email).pipe(
            map((data) =>
              masterDataActions.loadMasterDataSuccess({ data })
            ),
            catchError((error) =>
              of(masterDataActions.loadMasterDataFailure({ error }))
            )
          )
        )
      )
    );
  }
}
