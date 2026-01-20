import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type IdeaEvent =
  | { type: 'applyFilter'; payload: any }
  | { type: 'changePage'; payload: number }
  | { type: 'sortByColumn'; payload: { column: string; direction: 'asc' | 'desc' } }
  | { type: 'applyFilterByStatus'; payload: { status_id: number } }
  | { type: 'searchByText'; payload: { searchText: string } }
  | { type: 'taFilterChange'; payload:  number  }
  | { type: 'franchiseFilterChange'; payload:  number  }
  | { type: 'resetSearch' }
  | { type: 'submitIdea' }
  | { type: 'saveDraft' }
  | { type: 'closePopUp' }
  | { type: 'cancelIdea' }
  | { type: 'confirmPopUp' }
  | { type: 'nextIdea' }
  | { type: 'prevIdea' }
  | { type: 'toastEvent' ; payload: string };

@Injectable({ providedIn: 'root' })
export class IdeaEventsService {
  private eventsSubject = new Subject<IdeaEvent>();
  events$ = this.eventsSubject.asObservable();

  applyFilter(criteria: any) {
    this.eventsSubject.next({ type: 'applyFilter', payload: criteria });
  }

  changePage(page: number) {
    this.eventsSubject.next({ type: 'changePage', payload: page });
  }

  sortByColumn(column: string, direction: 'asc' | 'desc') {
    this.eventsSubject.next({ type: 'sortByColumn', payload: { column, direction } });
  }

  applyFilterByStatus(status_id: number) {
    this.eventsSubject.next({ type: 'applyFilterByStatus', payload: { status_id } });
  }

  searchByText(searchText: string) {
    this.eventsSubject.next({ type: 'searchByText', payload: { searchText } });
  }

  resetSearch() {
    this.eventsSubject.next({ type: 'resetSearch' });
  }

  submitIdea() {
    this.eventsSubject.next({ type: 'submitIdea' });
  }
  saveDraft() {
    this.eventsSubject.next({ type: 'saveDraft' });
  }
  cancelIdea() {
    this.eventsSubject.next({ type: 'cancelIdea' });
  }

  closePopUp() {
    this.eventsSubject.next({ type: 'closePopUp' });
  }

  confirmPopUp() {
    this.eventsSubject.next({ type: 'confirmPopUp' });
  }

  toastEvent(message:string) {
    this.eventsSubject.next({ type: 'toastEvent', payload: message} );
  }

  taFilterChange(ta_id:number) {
    this.eventsSubject.next({ type: 'taFilterChange', payload : ta_id} );
  }

  franchiseFilterChange(franchise_id:number) {
    this.eventsSubject.next({ type: 'franchiseFilterChange', payload : franchise_id} );
  }

  nextIdea() {
    this.eventsSubject.next({ type: 'nextIdea'} );
  }

  prevIdea() {
    this.eventsSubject.next({ type: 'prevIdea'} );
  }
}
