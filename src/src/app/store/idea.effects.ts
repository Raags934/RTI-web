import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { IdeaService } from './idea.service';
import * as ideaActions from './idea.actions';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { IdeaEventsService } from '../events/ideaServiceEvents';

@Injectable()
export class IdeaEffects {
  addIdea$;
  addDraftIdea$;
  loadIdeas$;
  savePrioritization$;
  submitPrioritization$;
  deleteIdea$;

  constructor(
    private actions$: Actions,
    private service: IdeaService,
    private ideaEvents: IdeaEventsService
  ) {
    this.loadIdeas$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ideaActions.LoadIdeas),
        mergeMap(() =>
          this.service.loadIdeas().pipe(
            map((ideas) => ideaActions.LoadIdeasSuccess({ ideas })),
            catchError((error) => of(ideaActions.loadIdeasFailure({ error: error.message })))
          )
        )
      )
    );

    this.addIdea$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ideaActions.AddIdea),
        mergeMap(({ idea }) =>
          this.service.addIdea(idea).pipe(
            map((idea) => {
              this.ideaEvents.toastEvent(`Idea #${idea.idea_uid} created successfully`);
              return ideaActions.AddIdeaSuccess({ idea });
            })
            ,
            catchError((error) => of(ideaActions.AddIdeaFailure({ error: error.message })))
          )
        )
      )
    );

    this.addDraftIdea$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ideaActions.AddDraftIdea),
        mergeMap(({ idea }) =>
          this.service.addDraftIdea(idea).pipe(
            map((idea) => {
              this.ideaEvents.toastEvent(`Idea #${idea.idea_uid} saved as draft successfully`);
              return ideaActions.AddDraftIdeaSuccess({ idea });
            }),
            catchError((error) => of(ideaActions.AddDraftIdeaFailure({ error: error.message })))
          )
        )
      )
    );

    this.savePrioritization$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ideaActions.SavePrioritization),
        mergeMap(({ payload, url }) =>
          this.service.addPrioritization(payload, url).pipe(
            mergeMap(() =>
              this.service.loadIdeas().pipe(
                map((ideas) => {
                  this.ideaEvents.toastEvent('Ranking saved successfully');
                  this.ideaEvents.savePrioritizationSuccess();
                  return ideaActions.SavePrioritizationSuccess({ ideas });
                }),
                catchError((error) => {
                  this.ideaEvents.prioritizationFailure(error.message);
                  return of(ideaActions.SavePrioritizationFailure({ error: error.message }));
                })
              )
            ),
            catchError((error) => {
              this.ideaEvents.prioritizationFailure(error.message);
              return of(ideaActions.SavePrioritizationFailure({ error: error.message }));
            })
          )
        )
      )
    );

    this.submitPrioritization$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ideaActions.SubmitPrioritization),
        mergeMap(({ payload, url }) =>
          this.service.addPrioritization(payload, url).pipe(
            mergeMap(() =>
              this.service.loadIdeas().pipe(
                map((ideas) => {
                  this.ideaEvents.toastEvent('Ranking submitted successfully');
                  this.ideaEvents.submitPrioritizationSuccess();
                  return ideaActions.SubmitPrioritizationSuccess({ ideas });
                }),
                catchError((error) => {
                  this.ideaEvents.prioritizationFailure(error.message);
                  return of(ideaActions.SubmitPrioritizationFailure({ error: error.message }));
                })
              )
            ),
            catchError((error) => {
              this.ideaEvents.prioritizationFailure(error.message);
              return of(ideaActions.SubmitPrioritizationFailure({ error: error.message }));
            })
          )
        )
      )
    );

    this.deleteIdea$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ideaActions.DeleteIdea),
        mergeMap(({ ideaId }) =>
          this.service.deleteIdea(ideaId).pipe(
            map(() => {
              this.ideaEvents.toastEvent(`Idea deleted successfully`);
              return ideaActions.DeleteIdeaSuccess({ ideaId });
            }),
            catchError((error) => {
              this.ideaEvents.toastEvent(`Failed to delete idea: ${error.message}`);
              return of(ideaActions.DeleteIdeaFailure({ error: error.message }));
            })
          )
        )
      )
    );
  }
}
