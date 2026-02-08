import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppState } from '../../../app.state.js';
import { Store, select } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';

import { LoadIdeas } from '../../../store/idea.actions.js';
import { Idea, ExportIdeasPayload } from '../../../models/idea.model.js';
import { IdeaEventsService } from '../../../events/ideaServiceEvents.js';
import { IdeaService } from '../../../store/idea.service.js';
import { TableHeader } from '../../../shared/components/table-header/table-header.js';
import { Table, TableColumn } from '../../../shared/components/table/table.js';
import { TableFilter } from '../../../shared/components/table-filter/table-filter.js';
import { Pagination } from '../../../shared/components/pagination/pagination.js';
import { StatusTab, creator } from '../../../shared/constants/statusTabs.js';
import { ideaDisplayColumns } from '../../../shared/constants/tableColumns.js';
import { Router } from '@angular/router';
import { IdeaHistory } from '../../ideas/idea-history/idea-history';
import { ViewIdeaOverlay } from '../../ideas/view-idea-overlay/view-idea-overlay';

@Component({
  selector: 'app-admin-home',
  imports: [FormsModule, TableHeader, TableFilter, Table, Pagination, IdeaHistory, ViewIdeaOverlay],
  templateUrl: './admin-home.html',
  styleUrl: './admin-home.scss',
})
export class AdminHome implements OnInit, OnDestroy {
  ideaDisplayColumns: TableColumn[] = ideaDisplayColumns;
  statusTabs: StatusTab[] = creator;
  showIdeaHistory: boolean = false;
  selectedIdeaId: number = 0;
  selectedIdeaUid: string = '';
  showViewIdeaOverlay: boolean = false;
  overlayIdeaUid: string | null = null;
  overlayStatusLabel: string | null = null;
  selectedIdea: Idea | null = null;
  /** Reset confirmation pop-up */
  showResetConfirm = false;
  resetConfirmIdeaId: number | null = null;
  resetConfirmIdeaUid = '';
  resetComment = '';
  ideas$: Observable<Idea[]>;
  ideas: Idea[] = [];
  filteredIdeas: Idea[] = [];
  pagedIdeas: Idea[] = [];
  currentPage = 1;
  pageSize = 6;
  totalPages = 1;

  private activeFilters = {
    franchise_id: null as number | null,
    ta_id: null as number | null,
    role_id: null as number | null,
    function_id: null as number | null,
  };

  private sub!: Subscription;

  constructor(
    private store: Store<AppState>,
    private ideaEvents: IdeaEventsService,
    private ideaService: IdeaService,
    private router: Router
  ) {
    this.ideas$ = this.store.select((state) => state.ideas);
  }

  ngOnInit(): void {
    // On every load/redirect: reset all filters to All and refresh list
    this.activeFilters.franchise_id = null;
    this.activeFilters.ta_id = null;
    this.activeFilters.role_id = null;
    this.activeFilters.function_id = null;
    this.store.dispatch(LoadIdeas());

    this.ideas$.subscribe((ideas) => {
      this.ideas = ideas;
      this.applyAllFilters();
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
      } else if (event.type === 'exportData') {
        this.exportData();
      } else if (event.type === 'viewIdeaHistory') {
        this.selectedIdeaId = event.payload.idea_id;
        this.selectedIdeaUid = event.payload.idea_uid;
        this.showIdeaHistory = true;
      } else if (event.type === 'closeIdeaHistory') {
        this.showIdeaHistory = false;
        this.selectedIdeaId = 0;
        this.selectedIdeaUid = '';
      } else if (event.type === 'viewIdeaOverlay') {
        this.overlayIdeaUid = event.payload.idea_uid;
        this.overlayStatusLabel = event.payload.statusLabel ?? null;
        this.showViewIdeaOverlay = true;
      } else if (event.type === 'resetIdea') {
        this.onResetIdea(event.payload.idea_id, event.payload.idea_uid);
      }
    });
  }

  onEditDetailsFromOverlay(idea: Idea): void {
    this.showViewIdeaOverlay = false;
    this.overlayIdeaUid = null;
    this.overlayStatusLabel = null;
    this.selectedIdea = null;
    this.router.navigate(['/ideas/', idea.idea_uid, 'edit']);
  }

  /** Open reset confirmation pop-up (Admin More Options → Reset Idea). */
  private onResetIdea(ideaId: number, ideaUid: string): void {
    this.resetConfirmIdeaId = ideaId;
    this.resetConfirmIdeaUid = ideaUid;
    this.resetComment = '';
    this.showResetConfirm = true;
  }

  /** Close reset confirmation when clicking backdrop. */
  onResetBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('reset-backdrop')) {
      this.closeResetConfirm();
    }
  }

  /** Close reset confirmation pop-up without calling API. */
  closeResetConfirm(): void {
    this.showResetConfirm = false;
    this.resetConfirmIdeaId = null;
    this.resetConfirmIdeaUid = '';
    this.resetComment = '';
  }

  /** Confirm reset: validate comment, call API, then close. */
  confirmReset(): void {
    const comment = this.resetComment?.trim();
    if (!comment) {
      alert('Admin Comment is required.');
      return;
    }
    const ideaId = this.resetConfirmIdeaId;
    if (ideaId == null) return;
    const payload = { comment, updated_by: 3 };
    this.ideaService.resetIdea(ideaId, payload).subscribe({
      next: () => {
        this.store.dispatch(LoadIdeas());
        this.closeResetConfirm();
      },
      error: (err) => {
        console.error('Reset idea failed', err);
        alert(err?.error?.message || err?.message || 'Failed to reset idea. Please try again.');
      },
    });
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  private applyAllFilters(): void {
    this.filteredIdeas = this.ideas.filter((idea) => {
      if (this.activeFilters.franchise_id !== null && idea.franchise_id !== this.activeFilters.franchise_id) {
        return false;
      }
      if (this.activeFilters.ta_id !== null && idea.ta_id !== this.activeFilters.ta_id) {
        return false;
      }
      if (this.activeFilters.role_id !== null) {
        const hasRole = idea.created_by?.roles?.some((role) => role.role_id === this.activeFilters.role_id);
        if (!hasRole) return false;
      }
      if (this.activeFilters.function_id !== null) {
        const hasFunction = idea.created_by?.functions?.some((func) => func.function_id === this.activeFilters.function_id);
        if (!hasFunction) return false;
      }
      return true;
    });

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

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagedIdeas();
    }
  }

  applyFilter(criteria: string): void {
    this.filteredIdeas = this.ideas.filter((idea) =>
      Object.values(idea).some((val) => val?.toString().toLowerCase().includes(criteria.toLowerCase()))
    );
    this.totalPages = Math.ceil(this.filteredIdeas.length / this.pageSize);
    this.currentPage = 1;
    this.updatePagedIdeas();
  }

  filterByStatus(status_id: number): void {
    if (status_id === 0) {
      this.filteredIdeas = [...this.ideas];
    } else {
      this.filteredIdeas = this.ideas.filter((i) => i.status_id === status_id);
    }
    this.totalPages = Math.ceil(this.filteredIdeas.length / this.pageSize);
    this.currentPage = 1;
    this.updatePagedIdeas();
  }

  private getValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  }

  sortBy(column: string, direction: 'asc' | 'desc'): void {
    const dir = direction === 'asc' ? 1 : -1;
    this.filteredIdeas = [...this.filteredIdeas].sort((a, b) => {
      const av = this.getValue(a, column);
      const bv = this.getValue(b, column);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    this.updatePagedIdeas();
  }

  exportData(): void {
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
        } catch (error) {
          console.error('Error in export process:', error);
          alert(`Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}. Please check console for details.`);
        }
      },
      error: (error) => {
        console.error('API Error exporting data:', error);
        let errorMessage = 'Failed to export data. Please try again.';
        if (error?.status) errorMessage += ` (Status: ${error.status})`;
        if (error?.message) errorMessage += ` - ${error.message}`;
        alert(errorMessage);
      },
    });
  }
}
