import { Component, OnInit } from '@angular/core';

import { AppState } from '../../app.state.js';
import { Store, select } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';

import { LoadIdeas } from '../../store/idea.actions.js';
import { Idea, ExportIdeasPayload } from '../../models/idea.model.js';
import { IdeaEventsService } from '../../events/ideaServiceEvents.js';
import { IdeaService } from '../../store/idea.service.js';
import { TableHeader } from '../../shared/components/table-header/table-header.js';
import { Table, TableColumn } from '../../shared/components/table/table.js';
import { HeaderFilter } from '../../shared/components/header-filter/header-filter.js';
import { TableFilter } from '../../shared/components/table-filter/table-filter.js';
import { Pagination } from '../../shared/components/pagination/pagination.js';
import { StatusTab, creator, harmonizer } from '../../shared/constants/statusTabs.js';
import { ideaDisplayColumns } from '../../shared/constants/tableColumns.js';
import { loadMasterData } from '../../store/masterData/masterData.actions.js';
import { IdeaHistory } from '../ideas/idea-history/idea-history.js';
import { ViewIdeaOverlay } from '../ideas/view-idea-overlay/view-idea-overlay.js';
import { Router } from '@angular/router';

@Component({
  selector: 'app-harmonizer',
  imports: [HeaderFilter, TableHeader, TableFilter, Table, Pagination, IdeaHistory, ViewIdeaOverlay],
  templateUrl: './harmonizer.html',
  styleUrl: './harmonizer.scss',
})
export class Harmonizer implements OnInit {
  userName: string = 'Karthik Perisetti';

  ideaDisplayColumns: TableColumn[] = ideaDisplayColumns;
  statusTabs: StatusTab[] = harmonizer;
  showIdeaHistory = false;
  selectedIdeaId = 0;
  selectedIdeaUid = '';
  showViewIdeaOverlay = false;
  overlayIdeaUid: string | null = null;
  overlayStatusLabel: string | null = null;
  ideas$: Observable<Idea[]>;
  ideas: Idea[] = [];
  filteredIdeas: Idea[] = [];
  pagedIdeas: Idea[] = [];
  currentPage = 1;
  pageSize = 6;
  totalPages = 1;
  currentFilterStatusId: number = 0; // For status column display (e.g. "Harmonization pending" when tab is 18)

  searchableKeys = ideaDisplayColumns.map((col) => col.key).filter((key) => key !== 'options');

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
    // On every load/redirect: refresh list and show All (no TA filter)
    this.store.dispatch(LoadIdeas());

    this.ideas$.subscribe((ideas) => {
      this.ideas = ideas;
      this.taFilterChange(null);
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
      } else if (event.type === 'taFilterChange') {
        this.taFilterChange(event.payload);
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
      }
    });
  }

  onCloseViewIdeaOverlay(): void {
    this.showViewIdeaOverlay = false;
    this.overlayIdeaUid = null;
    this.overlayStatusLabel = null;
    this.currentFilterStatusId = 0;
    this.filteredIdeas = [...this.ideas];
    this.totalPages = Math.ceil(this.filteredIdeas.length / this.pageSize);
    this.currentPage = 1;
    this.updatePagedIdeas();
    this.updateStatusCounts();
    this.store.dispatch(LoadIdeas());
  }

  onEditFromOverlay(idea: Idea): void {
    this.showViewIdeaOverlay = false;
    this.overlayIdeaUid = null;
    this.overlayStatusLabel = null;
    const isDraft = idea.status_id === 5;
    const path = isDraft ? '/ideas/' + idea.idea_uid + '/edit-draft' : '/ideas/' + idea.idea_uid + '/edit';
    this.router.navigate([path], { queryParams: { from: '/harmonizer' } });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  taFilterChange(ta_id: number | null) {
    if (ta_id == null) {
      this.filteredIdeas = [...this.ideas];
    } else {
      this.filteredIdeas = this.ideas.filter((idea) => idea.ta_id === ta_id);
    }
 
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
        } catch (error) {
          console.error('❌ Error in export process:', error);
          alert(`Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}. Please check console for details.`);
        }
      },
      error: (error) => {
        console.error('❌ API Error exporting data:', error);
        let errorMessage = 'Failed to export data. Please try again.';
        if (error?.status) {
          errorMessage += ` (Status: ${error.status})`;
        }
        if (error?.message) {
          errorMessage += ` - ${error.message}`;
        }
        alert(errorMessage);
      },
    });
  }
}
