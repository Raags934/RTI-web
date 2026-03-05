import { Component, OnInit, NO_ERRORS_SCHEMA } from '@angular/core';

import { AppState } from '../../app.state';
import { Store } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { LoadIdeas } from '../../store/idea.actions';
import { Idea, ExportIdeasPayload } from '../../models/idea.model';
import { IdeaEventsService } from '../../events/ideaServiceEvents';
import { IdeaService } from '../../store/idea.service';
import { AuthService } from '../../core/services/auth.service';
import { TableHeader } from '../../shared/components/table-header/table-header';
import { Table, TableColumn } from '../../shared/components/table/table';
import { HeaderFilter } from '../../shared/components/header-filter/header-filter';
import { TableFilter } from '../../shared/components/table-filter/table-filter';
import { Pagination } from '../../shared/components/pagination/pagination';
import { PopUp } from '../../shared/components/popup/popup';
import { StatusTab, funding } from '../../shared/constants/statusTabs';
import { ideaDisplayColumns, fundingDisplayColumns } from '../../shared/constants/tableColumns';

@Component({
  selector: 'app-funding',
  imports: [HeaderFilter, TableHeader, TableFilter, Table, Pagination, PopUp],
  templateUrl: './funding.html',
  styleUrl: './funding.scss',
})
export class Funding implements OnInit {
  userName: string = 'Karthik Perisetti';


  get ideaDisplayColumns(): TableColumn[] {
  if (this.currentFilterStatusId === 0) {
    // Remove "selected", "ranking_brand", and "ranking_franchise" columns when on "All" tab
    return fundingDisplayColumns.filter(col =>
      col.key !== 'selected' &&
      col.key !== 'ranking_brand' &&
      col.key !== 'ranking_franchise'
    );
  }
  return fundingDisplayColumns;
}

  statusTabs: StatusTab[] = funding;
  ideas$: Observable<Idea[]>;
  ideas: Idea[] = [];
  filteredIdeas: Idea[] = [];
  pagedIdeas: Idea[] = [];
  currentPage = 1;
  pageSize = 6;
  totalPages = 1;
  currentFilterStatusId: number = 0;

  /** Selected idea_id values for Freeze Data (bulk funding). */
  selectedIdeaIds: number[] = [];

  /** Fixed value_id for bulk funding API (Freeze Data). */
  readonly FREEZE_VALUE_ID = 34;

  /** Popup state for update funding status confirmation */
  showUpdateFundingPopup = false;
  updateFundingPopupTitle = 'Are you sure you want to update the funding status for the selected ideas?';
  updateFundingPopupHelper = 'This will update the funding status of the selected ideas.';
  updateFundingPopupCancelText = 'No';
  updateFundingPopupConfirmText = 'Yes';
  updateFundingPopupConfirmAction: 'confirmUpdateFundingStatus' = 'confirmUpdateFundingStatus';

  searchableKeys = ideaDisplayColumns.map((col) => col.key).filter((key) => key !== 'options');

  private sub!: Subscription;

  /** Current active TA and Franchise filters for this page. */
  private activeTaId: number | null = null;
  private activeFranchiseId: number | null = null;

  constructor(
    private store: Store<AppState>,
    private ideaEvents: IdeaEventsService,
    private ideaService: IdeaService,
    private authService: AuthService
  ) {
    this.ideas$ = this.store.select((state) => state.ideas);
  }

  ngOnInit(): void {
    this.ideas$.pipe(take(1)).subscribe((ideas) => {
      if (!ideas || ideas.length === 0) {
        this.store.dispatch(LoadIdeas());
      }
    });

    this.ideas$.subscribe((ideas) => {
      this.ideas = ideas;

      // If TA/Franchise are already selected in header filter (auto-populated),
      // apply them so funding list matches the visible filters.
      this.activeTaId = this.ideaEvents.getCurrentTaId();
      this.activeFranchiseId = this.ideaEvents.getCurrentFranchiseId();
      this.applyActiveFilters();

      this.totalPages = Math.ceil(this.filteredIdeas.length / this.pageSize);
      this.updatePagedIdeas();
      this.updateStatusCounts();
    });

    this.sub = this.ideaEvents.events$.subscribe((event) => {
      if (event.type === 'applyFilter') {
        this.applyFilter(event.payload);
      } else if (event.type === 'changePage') {
        this.changePage(event.payload);
      } else if (event.type === 'sortByColumn') {
        this.sortBy(event.payload.column as keyof Idea, event.payload.direction);
      } else if (event.type === 'applyFilterByStatus') {
        this.filterByStatus(event.payload.status_id);
      } else if (event.type === 'searchByText') {
        this.filterBySearchText(event.payload.searchText);
      } else if (event.type === 'freezeData') {
        this.showUpdateFundingPopup = true;
      } else if (event.type === 'confirmUpdateFundingStatus') {
        this.showUpdateFundingPopup = false;
        this.onFundingClick();
      } else if (event.type === 'exportData') {
        this.exportData();
      } else if (event.type === 'taFilterChange') {
        this.taFilterChange(event.payload);
      } else if (event.type === 'franchiseFilterChange') {
        this.franchiseFilterChange(event.payload);
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  taFilterChange(ta_id: number | null) {
    this.activeTaId = ta_id;
    this.applyActiveFilters();
  }

  franchiseFilterChange(franchise_id: number | null) {
    this.activeFranchiseId = franchise_id;
    this.applyActiveFilters();
  }

  /** Apply current TA + Franchise filters together. */
  private applyActiveFilters(): void {
    let list = [...this.ideas];

    if (this.activeTaId != null) {
      list = list.filter((idea) => idea.ta_id === this.activeTaId);
    }
    if (this.activeFranchiseId != null) {
      list = list.filter((idea) => idea.franchise_id === this.activeFranchiseId);
    }

    this.filteredIdeas = list;
    this.totalPages = Math.ceil(this.filteredIdeas.length / this.pageSize);
    this.currentPage = 1;
    this.updatePagedIdeas();
  }


  updatePagedIdeas(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.pagedIdeas = this.filteredIdeas.slice(startIndex, startIndex + this.pageSize);
  }

  updateStatusCounts(): void {
    this.statusTabs.forEach((tab) => {
      if (tab.status_id) {
        tab.count = this.ideas.filter((i) => i.status_id === tab.status_id).length;
      } else {
        tab.count = this.ideas.length;
      }
    });
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagedIdeas();
    }
  }

  applyFilter(criteria: string) {
    this.filteredIdeas = this.ideas.filter((idea) =>
      Object.values(idea).some((val) =>
        val?.toString().toLowerCase().includes(criteria.toLowerCase())
      )
    );
    this.totalPages = Math.ceil(this.filteredIdeas.length / this.pageSize);
    this.currentPage = 1; // reset to first page
    this.updatePagedIdeas();
  }

  filterByStatus(status_id: number) {
    this.currentFilterStatusId = status_id;
    if (status_id === 0) {
      this.filteredIdeas = [...this.ideas];
    } else {
      this.filteredIdeas = this.ideas.filter((i) => i.status_id === status_id);
    }
    this.totalPages = Math.ceil(this.filteredIdeas.length / this.pageSize);
    this.currentPage = 1;
    this.updatePagedIdeas();
  }

  filterBySearchText(searchText: string) {
    const search = searchText.toLowerCase().trim();
    if (!search) {
      this.filteredIdeas = [...this.ideas];
    } else {
      this.filteredIdeas = this.ideas.filter((idea) => {
        return this.searchableKeys.some((key) => {
          if (key === 'TAC_or_RP') {
            const tac = idea.target_aspirational_claim ?? '';
            const rp = idea.research_proposal ?? '';
            return (
              String(tac).toLowerCase().includes(search) ||
              String(rp).toLowerCase().includes(search)
            );
          }
          const value = this.getValue(idea, key);
          return String(value ?? '')
            .toLowerCase()
            .includes(search);
        });
      });
    }
    this.totalPages = Math.ceil(this.filteredIdeas.length / this.pageSize);
    this.currentPage = 1;
    this.updatePagedIdeas();
  }

  private getValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  }

  sortBy(column: string, direction: 'asc' | 'desc') {
    const dir = direction === 'asc' ? 1 : -1;

    this.filteredIdeas = [...this.filteredIdeas].sort((a, b) => {
      let av = this.getValue(a, column);
      let bv = this.getValue(b, column);
      if (column === 'rti_unique_id') {
        av = av != null ? String(av) : '';
        bv = bv != null ? String(bv) : '';
      }

      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });

    this.updatePagedIdeas();
  }

  exportData() {
    const payload: ExportIdeasPayload = {
      id: this.filteredIdeas.map((idea) => idea.idea_id),
    };

    this.ideaService.exportIdeas(payload).subscribe({
      next: (blob: Blob) => {
        try {
          if (!blob || blob.size === 0) {
            throw new Error('Empty response received from server');
          }
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `ideas_export_${new Date().getTime()}.xlsx`;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          }, 100);
          this.ideaEvents.toastEvent('Export completed successfully.');
        } catch (error) {
          console.error('Error in export process:', error);
          this.ideaEvents.toastEvent(
            `Failed to export: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      },
      error: (error: { status?: number; message?: string }) => {
        console.error('API Error exporting data:', error);
        let errorMessage = 'Failed to export data. Please try again.';
        if (error?.status) errorMessage += ` (Status: ${error.status})`;
        if (error?.message) errorMessage += ` - ${error.message}`;
        this.ideaEvents.toastEvent(errorMessage);
      },
    });
  }

  /** Called when Funding button is clicked: call bulk funding API directly (no popup). */
  onFundingClick() {
    if (!this.selectedIdeaIds?.length) {
      this.ideaEvents.toastEvent('Please select at least one idea.');
      return;
    }
    const updatedBy = this.authService.getCurrentUserId() ?? 1;
    this.ideaService
      .putFundingBulk({
        value_id: this.FREEZE_VALUE_ID,
        idea_ids: [...this.selectedIdeaIds],
        updated_by: updatedBy,
      })
      .subscribe({
        next: (res: unknown) => {
          this.selectedIdeaIds = [];
          this.store.dispatch(LoadIdeas());
          const msg = (res as { message?: string })?.message ?? 'Ideas updated successfully.';
          this.ideaEvents.toastEvent(msg);
        },
        error: (err: { error?: { message?: string }; message?: string }) => {
          const msg = err?.error?.message || err?.message || 'Failed to update ideas.';
          this.ideaEvents.toastEvent(msg);
        },
      });
  }
}
