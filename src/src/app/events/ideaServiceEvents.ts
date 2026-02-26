 import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type IdeaEvent =
  | { type: 'applyFilter'; payload: any }
  | { type: 'changePage'; payload: number }
  | { type: 'sortByColumn'; payload: { column: string; direction: 'asc' | 'desc' } }
  | { type: 'applyFilterByStatus'; payload: { status_id: number } }
  | { type: 'searchByText'; payload: { searchText: string } }
  | { type: 'taFilterChange'; payload: number | null }
  | { type: 'franchiseFilterChange'; payload: number | null }
  | { type: 'roleFilterChange'; payload: number | null }
  | { type: 'functionFilterChange'; payload: number | null }
  | { type: 'resetSearch' }
  | { type: 'submitIdea' }
  | { type: 'saveDraft' }
  | { type: 'approveIdea' }
  | { type: 'closePopUp' }
  | { type: 'cancelIdea' }
  | { type: 'confirmPopUp' }
  | { type: 'confirmSubmitRanking' }
  | { type: 'rankingChanged'; payload: { idea_id: number; ranking_brand: string | null } }
  | { type: 'rankingTaChanged'; payload: { idea_id: number; ranking_franchise: string | null } }
  | { type: 'nextIdea' }
  | { type: 'prevIdea' }
  | { type: 'toastEvent'; payload: string }
  | { type: 'abandonIdea' }
  | { type: 'needMoreInfo' }
  | { type: 'assessIdea' }
  | { type: 'submitToHarmonization' }
  | { type: 'enterStudyDetails' }
  | { type: 'submitStudyDetailsConfirmation' }
  | { type: 'savePrioritizationSuccess' }
  | { type: 'submitPrioritizationSuccess' }
  | { type: 'prioritizationFailure'; payload: string }
  | { type: 'exportData' }
  | { type: 'viewIdeaHistory'; payload: { idea_id: number; idea_uid: string } }
  | { type: 'closeIdeaHistory' }
  | { type: 'resetIdea'; payload: { idea_id: number; idea_uid: string } }
  | { type: 'freezeData' }
  | { type: 'confirmFreezeData' }
  | { type: 'viewIdeaOverlay'; payload: { idea_uid: string; statusLabel?: string } }
  | { type: 'openUpdateFundingStatus' }
  | { type: 'saveUpdateFundingStatus' }

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
  approveIdea() {
    this.eventsSubject.next({ type: 'approveIdea' });
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

  toastEvent(message: string) {
    this.eventsSubject.next({ type: 'toastEvent', payload: message });
  }

  taFilterChange(ta_id: number | null) {
    this.eventsSubject.next({ type: 'taFilterChange', payload: ta_id });
  }

  franchiseFilterChange(franchise_id: number | null) {
    this.eventsSubject.next({ type: 'franchiseFilterChange', payload: franchise_id });
  }

  roleFilterChange(role_id: number | null) {
    this.eventsSubject.next({ type: 'roleFilterChange', payload: role_id });
  }

  functionFilterChange(function_id: number | null) {
    this.eventsSubject.next({ type: 'functionFilterChange', payload: function_id });
  }

  nextIdea() {
    this.eventsSubject.next({ type: 'nextIdea' });
  }

  prevIdea() {
    this.eventsSubject.next({ type: 'prevIdea' });
  }

  confirmSubmitRanking() {
    this.eventsSubject.next({ type: 'confirmSubmitRanking' });
  }

  rankingChanged(idea_id: number, ranking_brand: string | null) {
    this.eventsSubject.next({ type: 'rankingChanged', payload: { idea_id, ranking_brand } });
  }

  rankingTaChanged(idea_id: number, ranking_franchise: string | null) {
    this.eventsSubject.next({ type: 'rankingTaChanged', payload: { idea_id, ranking_franchise } });
  }

  savePrioritizationSuccess() {
    this.eventsSubject.next({ type: 'savePrioritizationSuccess' });
  }

  submitPrioritizationSuccess() {
    this.eventsSubject.next({ type: 'submitPrioritizationSuccess' });
  }

  prioritizationFailure(error: string) {
    this.eventsSubject.next({ type: 'prioritizationFailure', payload: error });
  }

  exportData() {
    this.eventsSubject.next({ type: 'exportData' });
  }

  viewIdeaHistory(idea_id: number, idea_uid: string) {
    this.eventsSubject.next({ type: 'viewIdeaHistory', payload: { idea_id, idea_uid } });
  }

  closeIdeaHistory() {
    this.eventsSubject.next({ type: 'closeIdeaHistory' });
  }

  /** Emitted when "Reset Idea" is clicked on admin page only; handled by admin-home. */
  resetIdea(idea_id: number, idea_uid: string) {
    this.eventsSubject.next({ type: 'resetIdea', payload: { idea_id, idea_uid } });
  }

  /** Open View Idea Details in overlay instead of full page (dashboard, prioritization, admin). */
  viewIdeaOverlay(idea_uid: string, statusLabel?: string) {
    this.eventsSubject.next({ type: 'viewIdeaOverlay', payload: { idea_uid, statusLabel } });
  }

  abandonIdea() {
    this.eventsSubject.next({ type: 'abandonIdea'} );
  }

  needMoreInfo() {
    this.eventsSubject.next({ type: 'needMoreInfo'} );
  }

  assessIdea() {
    this.eventsSubject.next({ type: 'assessIdea'} );
  }

  submitToHarmonization() {
    this.eventsSubject.next({ type: 'submitToHarmonization'} );
  }

  enterStudyDetails() {
    this.eventsSubject.next({ type: 'enterStudyDetails'} );
  }

  submitStudyDetailsConfirmation() {
    this.eventsSubject.next({ type: 'submitStudyDetailsConfirmation'} );
  }
 
  freezeData() {
    this.eventsSubject.next({ type: 'freezeData' });
  }

  confirmFreezeData() {
    this.eventsSubject.next({ type: 'confirmFreezeData' });
  }

  /** Open the Update funding status popup (from Idea View when from=funding and idea is Funding Pending). */
  openUpdateFundingStatus() {
    this.eventsSubject.next({ type: 'openUpdateFundingStatus' });
  }

  saveUpdateFundingStatus() {
    this.eventsSubject.next({ type: 'saveUpdateFundingStatus' });
  }
}
