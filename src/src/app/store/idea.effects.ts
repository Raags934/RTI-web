import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { IdeaService } from './idea.service';
import * as ideaActions from './idea.actions';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { IdeaEventsService } from '../events/ideaServiceEvents';
import { AppState } from '../app.state';

@Injectable()
export class IdeaEffects {
  addIdea$;
  addDraftIdea$;
  loadIdeas$;
  savePrioritization$;
  submitPrioritization$;
  deleteIdea$;
  updateIdea$;
  /** Redirect to idea-dashboard (all filter) and reload after add/update success */
  redirectToDashboardOnSuccess$;

  constructor(
    private actions$: Actions,
    private service: IdeaService,
    private ideaEvents: IdeaEventsService,
    private router: Router,
    private store: Store<AppState>
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

    this.updateIdea$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ideaActions.UpdateIdea),
        mergeMap(({ ideaId, idea }) =>
          this.service.updateIdea(ideaId, idea).pipe(
            mergeMap((response) =>
              this.service.loadIdeas().pipe(
                map((ideas) => {
                  // Find the updated idea from the reloaded list
                  const updatedIdea = ideas.find((i) => i.idea_id === response.idea_id);
                  if (updatedIdea) {
                    this.ideaEvents.toastEvent(`Idea #${updatedIdea.idea_uid} updated successfully`);
                    return ideaActions.UpdateIdeaSuccess({ idea: updatedIdea });
                  } else {
                    // Fallback: show success message and reload ideas (idea will be updated via LoadIdeasSuccess)
                    this.ideaEvents.toastEvent(response.message || 'Idea updated successfully');
                    // Return success with a minimal idea object - reducer will handle via LoadIdeasSuccess
                    return ideaActions.UpdateIdeaSuccess({ 
                      idea: { idea_id: response.idea_id } as any 
                    });
                  }
                }),
                catchError((error) => {
                  this.ideaEvents.toastEvent(`Failed to reload ideas after update: ${error.message}`);
                  return of(ideaActions.UpdateIdeaFailure({ error: error.message }));
                })
              )
            ),
            catchError((error) => {
              this.ideaEvents.toastEvent(`Failed to update idea: ${error.message}`);
              return of(ideaActions.UpdateIdeaFailure({ error: error.message }));
            })
          )
        )
      )
    );

    this.redirectToDashboardOnSuccess$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(
            ideaActions.AddIdeaSuccess,
            ideaActions.AddDraftIdeaSuccess,
            ideaActions.UpdateIdeaSuccess
          ),
          tap(() => {
            this.router.navigate(['/']);
            this.store.dispatch(ideaActions.LoadIdeas());
          })
        ),
      { dispatch: false }
    );
  }
}
