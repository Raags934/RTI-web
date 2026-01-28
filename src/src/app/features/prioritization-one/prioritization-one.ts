import { Component, OnInit } from '@angular/core';
import { HeaderFilter } from '../../shared/components/header-filter/header-filter';
import { Pagination } from '../../shared/components/pagination/pagination';
import { TableFilter } from '../../shared/components/table-filter/table-filter';
import { TableHeader } from '../../shared/components/table-header/table-header';
import { Table, TableColumn } from '../../shared/components/table/table';
import { Buttons } from '../../shared/components/buttons/buttons';
import { PopUp } from '../../shared/components/popup/popup';
import { Popup, PopupConfigs } from '../../shared/constants/popUp';
import { IdeaHistory } from '../ideas/idea-history/idea-history';
import { Store } from '@ngrx/store';
import { Observable, Subscription, take } from 'rxjs';
import { AppState } from '../../app.state';
import { IdeaEventsService } from '../../events/ideaServiceEvents';
import { Idea, ExportIdeasPayload } from '../../models/idea.model';
import { PrioritizationPayload, ProductRankingChange } from '../../models/prioritization.model';
import { StatusTab } from '../../shared/constants/statusTabs';
// import { ideaDisplayColumns } from '../../shared/constants/tableColumns';
import { LoadIdeas, SavePrioritization, SubmitPrioritization } from '../../store/idea.actions';
import { IdeaService } from '../../store/idea.service';

export const ideaDisplayColumns: TableColumn[] = [
  { key: 'rti_unique_id', label: 'RTI UID', sortable: true, width: 'medium' },
  { key: 'research_pathway.pathway_name', label: 'Research Pathway', sortable: true, width: 'small' },
  { key: 'franchise.franchise_name', label: 'Franchise', sortable: true, width: 'small' },
  { key: 'therapeutic_area.ta_name', label: 'Therapeutic Area', sortable: true, width: 'small' },
  { key: 'brand.brand_name', label: 'Product Family (Brand)', sortable: true, width: 'medium' },
  { key: 'product_type', label: 'Product Type', sortable: true, width: 'medium' },
  { key: 'product.product_name', label: 'Product / Project', sortable: true, width: 'medium' },
  { key: 'TAC_or_RP', label: 'Target Aspirational Claim / Research Proposal', sortable: true, width: 'large' },
  { key: 'ranking_brand', label: 'Product Ranking', sortable: true, width: 'small' },
  { key: 'status.status_name', label: 'Status', sortable: true, width: 'small' },
  { key: 'options', label: '', sortable: false, width: 'xsmall' }
];

// Custom status tabs for prioritization page
const prioritizationStatusTabs: StatusTab[] = [
  { label: 'All', status_id: 0 },
  { label: 'Product Prioritization Pending', status_id: 11 }, // DATA_CHECKED status
  { label: 'Product Ranked', status_id: 12 }, // PRODUCT_RANKED status
].map((item) => ({ ...item, count: 0 }));

@Component({
  selector: 'app-prioritization-one',
  imports: [HeaderFilter, TableHeader, TableFilter, Table, Buttons, PopUp, IdeaHistory],
  templateUrl: './prioritization-one.html',
  styleUrl: './prioritization-one.scss',
})
export class PrioritizationOne implements OnInit {
  userName: string = 'Karthik Perisetti';
  showNewIdeaButton: boolean = false;

  ideaDisplayColumns: TableColumn[] = ideaDisplayColumns;
  statusTabs: StatusTab[] = prioritizationStatusTabs;
  popup: Popup = PopupConfigs.rankingSaved;
  showIdeaHistory: boolean = false;
  selectedIdeaId: number = 0;
  selectedIdeaUid: string = '';
  ideas$: Observable<Idea[]>;
  ideas: Idea[] = [];
  filteredIdeas: Idea[] = [];
  pagedIdeas: Idea[] = [];
  currentPage = 1;
  pageSize = 1000;
  totalPages = 1;
  currentFilterStatusId: number = 0; // Track current filter status_id

  searchableKeys = ideaDisplayColumns.map((col) => col.key).filter((key) => key !== 'options');

  // Array to store ranking changes
  rankingChanges: ProductRankingChange[] = [];

  private sub!: Subscription;

  constructor(
    private store: Store<AppState>,
    private ideaEvents: IdeaEventsService,
    private ideaService: IdeaService
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
      this.taFilterChange(3);
      this.totalPages = Math.ceil(this.filteredIdeas.length / this.pageSize);
      this.updatePagedIdeas();
      this.updateStatusCounts();
    });

    this.sub = this.ideaEvents.events$.subscribe((event: any) => {
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
      } else if (event.type === 'rankingChanged') {
        // Add or update ranking change in array
        console.log('📥 Received ranking change event:', event.payload);

        const existingIndex = this.rankingChanges.findIndex(
          (item) => item.idea_id === event.payload.idea_id
        );
        if (existingIndex !== -1) {
          // Update existing entry
          const oldValue = this.rankingChanges[existingIndex].ranking_brand;
          this.rankingChanges[existingIndex] = event.payload;
          console.log(`✏️ Updated ranking for idea_id ${event.payload.idea_id}: ${oldValue} → ${event.payload.ranking_brand}`);
        } else {
          // Add new entry
          this.rankingChanges.push(event.payload);
          console.log(`➕ Added new ranking for idea_id ${event.payload.idea_id}: ${event.payload.ranking_brand}`);
        }
        console.log('📊 Current ranking changes array:', JSON.stringify(this.rankingChanges, null, 2));
      } else if (event.type === 'closePopUp') {
        this.popup.open = false;
      } else if (event.type === 'confirmSubmitRanking') {
        this.popup.open = false;
        // Actually submit the ranking
        const payload: PrioritizationPayload = {
          ideas: this.rankingChanges,
          locked: true,
          updated_by: 1
        };
        const url = 'ideas/product-prioritization';
        this.store.dispatch(SubmitPrioritization({ payload, url }));
      } else if (event.type === 'savePrioritizationSuccess') {
        this.popup = PopupConfigs.rankingSaved;
        this.popup.open = true;
        this.taFilterChange(3);
        this.totalPages = Math.ceil(this.filteredIdeas.length / this.pageSize);
        this.updatePagedIdeas();
        this.updateStatusCounts();
        this.rankingChanges = [];
      } else if (event.type === 'submitPrioritizationSuccess') {
        // Close popup after successful submission
        this.popup.open = false;
        this.taFilterChange(3);
        this.totalPages = Math.ceil(this.filteredIdeas.length / this.pageSize);
        this.updatePagedIdeas();
        this.updateStatusCounts();
        this.rankingChanges = [];
      } else if (event.type === 'prioritizationFailure') {
        alert(event.payload);
        console.error('Error saving ranking:', event.payload);
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
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  taFilterChange(ta_id: number) {
    this.filteredIdeas = this.ideas.filter(idea => idea.ta_id === ta_id);

    // Populate rankingChanges array with all filtered ideas
    this.rankingChanges = this.filteredIdeas.map(idea => ({
      idea_id: idea.idea_id,
      ranking_brand: idea.ranking_brand || null
    }));

    console.log('📋 Initial ranking changes populated:', JSON.stringify(this.rankingChanges, null, 2));

    this.totalPages = Math.ceil(this.filteredIdeas.length / this.pageSize);
    this.currentPage = 1;
    this.updatePagedIdeas();
    // Reset filter status when TA filter changes
    this.currentFilterStatusId = 0;
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
    console.log('status :' + status_id);
    this.currentFilterStatusId = status_id; // Track current filter
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
      const av = this.getValue(a, column);
      const bv = this.getValue(b, column);

      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });

    this.updatePagedIdeas();
  }

  saveRanking() {
    const payload: PrioritizationPayload = {
      ideas: this.rankingChanges,
      locked: false,
      updated_by: 1
    };

    const url = 'ideas/product-prioritization';

    this.store.dispatch(SavePrioritization({ payload, url }));
  }

  submitRanking() {
    // Show confirmation popup before submission
    this.popup = PopupConfigs.submitRankingConfirm;
    this.popup.open = true;
  }

  // Helper method to view current ranking changes (for debugging)
  getRankingChanges() {
    console.log('📊 Current Ranking Changes:', this.rankingChanges);
    return this.rankingChanges;
  }

  exportData() {
    const payload: ExportIdeasPayload = {
      id: this.filteredIdeas.map(idea => idea.idea_id)
    };

    this.ideaService.exportIdeas(payload).subscribe({
      next: (blob: Blob) => {
        if (!blob || blob.size === 0) {
          alert('Empty response received from server');
          return;
        }
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `prioritization_one_export_${new Date().getTime()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error exporting data:', error);
        alert('Failed to export data. Please try again.');
      }
    });
  }
}

