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
import { ViewIdeaOverlay } from '../ideas/view-idea-overlay/view-idea-overlay';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { AppState } from '../../app.state';
import { IdeaEventsService } from '../../events/ideaServiceEvents';
import { Router } from '@angular/router';
import { Idea, ExportIdeasPayload } from '../../models/idea.model';
import { PrioritizationPayload, TARankingChange } from '../../models/prioritization.model';
import { StatusTab } from '../../shared/constants/statusTabs';
// import { ideaDisplayColumns } from '../../shared/constants/tableColumns';
import { LoadIdeas, SavePrioritization, SubmitPrioritization } from '../../store/idea.actions';
import { IdeaService } from '../../store/idea.service';
import { AuthService } from '../../core/services/auth.service';

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
  { key: 'ranking_franchise', label: 'Franchise Ranking', sortable: true, width: 'small' },
  { key: 'status.status_name', label: 'Status', sortable: true, width: 'small' },
  { key: 'options', label: '', sortable: false, width: 'xsmall' }
];

// Custom status tabs for prioritization page
const prioritizationStatusTabs: StatusTab[] = [
  { label: 'All', status_id: 0 },
  { label: 'TA Prioritization Pending', status_id: 12 }, // DATA_CHECKED status
  { label: 'TA Ranked', status_id: 13 }, // PRODUCT_RANKED status
].map((item) => ({ ...item, count: 0 }));

@Component({
  selector: 'app-prioritization-two',
  imports: [HeaderFilter, TableHeader, TableFilter, Table, Buttons, PopUp, IdeaHistory, ViewIdeaOverlay, Pagination],
  templateUrl: './prioritization-two.html',
  styleUrl: './prioritization-two.scss',
})
export class PrioritizationTwo implements OnInit {
  userName: string = 'Karthik Perisetti';
  showNewIdeaButton: boolean = false;

  ideaDisplayColumns: TableColumn[] = ideaDisplayColumns;
  statusTabs: StatusTab[] = prioritizationStatusTabs;
  popup: Popup = PopupConfigs.rankingSaved;
  showIdeaHistory: boolean = false;
  selectedIdeaId: number = 0;
  selectedIdeaUid: string = '';
  showViewIdeaOverlay = false;
  overlayIdeaUid: string | null = null;
  overlayStatusLabel: string | null = null;
  ideas$: Observable<Idea[]>;
  ideas: Idea[] = [];
  filteredIdeas: Idea[] = [];
  pagedIdeas: Idea[] = [];
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  currentFilterStatusId: number = 0; // Track current filter status_id

  // Status IDs where pagination is hidden (TA Prioritization Pending, TA Ranked)
  private readonly noPaginationStatusIds = [12, 13];

  searchableKeys = ideaDisplayColumns.map((col) => col.key).filter((key) => key !== 'options');

  /** Ideas to display: all filtered when in Pending/Ranked tab, else current page */
  get displayedIdeas(): Idea[] {
    return this.noPaginationStatusIds.includes(this.currentFilterStatusId)
      ? this.filteredIdeas
      : this.pagedIdeas;
  }

  get showPagination(): boolean {
    return !this.noPaginationStatusIds.includes(this.currentFilterStatusId);
  }

  // Array to store ranking changes
  rankingChanges: TARankingChange[] = [];
  // Store original rankings when ideas are loaded to detect changes
  originalRankings: Map<number, string | null> = new Map();

  private sub!: Subscription;

  constructor(
    private store: Store<AppState>,
    private ideaEvents: IdeaEventsService,
    private ideaService: IdeaService,
    private router: Router,
    private authService: AuthService
  ) {
    this.ideas$ = this.store.select((state) => state.ideas);
  }

  ngOnInit(): void {
    // On every load/redirect: refresh list and show All (no TA filter)
    this.store.dispatch(LoadIdeas());

    this.ideas$.subscribe((ideas) => {
      this.ideas = ideas;
      // Store original rankings when ideas are loaded
      ideas.forEach(idea => {
        this.originalRankings.set(
          idea.idea_id,
          idea.ranking_franchise != null ? String(idea.ranking_franchise) : null
        );
      });
      console.log('📋 Original rankings stored on ideas load:', Array.from(this.originalRankings.entries()));
      this.taFilterChange(null);
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
      } else if (event.type === 'rankingTaChanged') {
        // Add or update ranking change in array
        console.log('📥 Received ranking change event:', event.payload);

        const existingIndex = this.rankingChanges.findIndex(
          (item) => item.idea_id === event.payload.idea_id
        );
        if (existingIndex !== -1) {
          // Update existing entry
          const oldValue = this.rankingChanges[existingIndex].ranking_franchise;
          this.rankingChanges[existingIndex] = event.payload;
          console.log(`✏️ Updated ranking for idea_id ${event.payload.idea_id}: ${oldValue} → ${event.payload.ranking_franchise}`);
        } else {
          // Add new entry
          this.rankingChanges.push(event.payload);
          console.log(`➕ Added new ranking for idea_id ${event.payload.idea_id}: ${event.payload.ranking_franchise}`);
        }
        console.log('📊 Current ranking changes array:', JSON.stringify(this.rankingChanges, null, 2));
      } else if (event.type === 'closePopUp') {
        this.popup.open = false;
      } else if (event.type === 'confirmSubmitRanking') {
        this.popup.open = false;
        const displayedIds = new Set(this.displayedIdeas.map((i) => i.idea_id));
        const rankedIdeas = this.rankingChanges.filter(
          (c) => c.ranking_franchise != null && displayedIds.has(c.idea_id)
        );

        console.log('🔍 Submit - Original rankings:', Array.from(this.originalRankings.entries()));
        console.log('🔍 Submit - Current ranking changes:', rankedIdeas);

        const basePayload: PrioritizationPayload = {
          ideas: rankedIdeas.map((c) => {
            const originalRank = this.originalRankings.get(c.idea_id);
            const currentRank = c.ranking_franchise;
            // Normalize both to strings for comparison
            const originalRankStr = originalRank != null ? String(originalRank) : null;
            const currentRankStr = currentRank != null ? String(currentRank) : null;
            // lock: true if item had an original rank and was changed, false otherwise (new entry)
            const lock = originalRankStr != null && originalRankStr !== currentRankStr;

            console.log(`🔍 Submit - Idea ${c.idea_id}: original=${originalRankStr}, current=${currentRankStr}, lock=${lock}`);

            return {
              idea_id: c.idea_id,
              ranking_franchise: currentRankStr,
              lock: lock,
            };
          }),
          locked: true,
          updated_by: 1,
        };

        const payload = this.buildFinalPayload(basePayload);

        console.log('📤 Submit - Final payload:', JSON.stringify(payload, null, 2));

        const url = 'ideas/ta-prioritization';
        this.store.dispatch(SubmitPrioritization({ payload, url }));
      } else if (event.type === 'savePrioritizationSuccess') {
        this.popup = PopupConfigs.rankingSaved;
        this.popup.open = true;
        this.taFilterChange(null);
        this.totalPages = Math.ceil(this.filteredIdeas.length / this.pageSize);
        this.updatePagedIdeas();
        this.updateStatusCounts();
        this.rankingChanges = [];
        this.originalRankings.clear();
      } else if (event.type === 'submitPrioritizationSuccess') {
        // Close popup after successful submission
        this.popup.open = false;
        this.taFilterChange(null);
        this.totalPages = Math.ceil(this.filteredIdeas.length / this.pageSize);
        this.updatePagedIdeas();
        this.updateStatusCounts();
        this.rankingChanges = [];
        this.originalRankings.clear();
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
      } else if (event.type === 'viewIdeaOverlay') {
        this.overlayIdeaUid = event.payload.idea_uid;
        this.overlayStatusLabel = event.payload.statusLabel ?? null;
        this.showViewIdeaOverlay = true;
      }
    });
  }

  onEditFromOverlay(idea: Idea): void {
    this.showViewIdeaOverlay = false;
    this.overlayIdeaUid = null;
    this.overlayStatusLabel = null;
    this.router.navigate(['/ideas/', idea.idea_uid, 'edit']);
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  taFilterChange(ta_id: number | null) {
    if (ta_id == null) {
      this.filteredIdeas = [...this.ideas];
    } else {
      this.filteredIdeas = this.ideas.filter(idea => idea.ta_id === ta_id);
    }

    // Original rankings are already stored when ideas are loaded
    // Only update if new ideas are added that weren't in originalRankings
    this.ideas.forEach(idea => {
      if (!this.originalRankings.has(idea.idea_id)) {
        this.originalRankings.set(
          idea.idea_id,
          idea.ranking_franchise != null ? String(idea.ranking_franchise) : null
        );
      }
    });

    // Populate rankingChanges with all filtered ideas; use existing rank from response so unchanged ranks are sent in payload.
    // Normalize ranking_franchise to string so payload is consistent (API may return number).
    this.rankingChanges = this.filteredIdeas.map(idea => ({
      idea_id: idea.idea_id,
      ranking_franchise: idea.ranking_franchise != null ? String(idea.ranking_franchise) : null
    }));

    console.log('📋 Initial ranking changes populated:', JSON.stringify(this.rankingChanges, null, 2));
    console.log('📋 Original rankings stored:', Array.from(this.originalRankings.entries()));

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
    const displayedIds = new Set(this.displayedIdeas.map((i) => i.idea_id));
    const rankedInView = this.rankingChanges.filter(
      (c) => c.ranking_franchise != null && displayedIds.has(c.idea_id)
    );

    console.log('🔍 Original rankings:', Array.from(this.originalRankings.entries()));
    console.log('🔍 Current ranking changes:', rankedInView);

    const basePayload: PrioritizationPayload = {
      ideas: rankedInView.map((c) => {
        const originalRank = this.originalRankings.get(c.idea_id);
        const currentRank = c.ranking_franchise;
        // Normalize both to strings for comparison
        const originalRankStr = originalRank != null ? String(originalRank) : null;
        const currentRankStr = currentRank != null ? String(currentRank) : null;
        // lock: true if item had an original rank and was changed, false otherwise (new entry)
        const lock = originalRankStr != null && originalRankStr !== currentRankStr;

        console.log(`🔍 Idea ${c.idea_id}: original=${originalRankStr}, current=${currentRankStr}, lock=${lock}`);

        return {
          idea_id: c.idea_id,
          ranking_franchise: currentRankStr,
          lock: lock,
        };
      }),
      locked: false,
      updated_by: this.authService.getCurrentUserId() ?? 1
    };

    const payload = this.buildFinalPayload(basePayload);

    console.log('📤 Final payload:', JSON.stringify(payload, null, 2));

    const url = 'ideas/ta-prioritization';

    this.store.dispatch(SavePrioritization({ payload, url }));
  }

  /**
   * Build final payload for API.
   * Case 1 (new ranks, no duplicates): Pass through user-selected ranks as-is [1, 5, 6, 8, 9].
   * Case 2 (re-rank with conflicts): Run reorder to resolve duplicates via shifting; output unique ranks.
   */
  private buildFinalPayload(basePayload: PrioritizationPayload): PrioritizationPayload {
    if (!basePayload.ideas?.length) {
      return basePayload;
    }
    const ideas = basePayload.ideas as TARankingChange[];
    const rankValues = ideas
      .map((i) => (i.ranking_franchise != null ? String(i.ranking_franchise).trim() : null))
      .filter((r): r is string => r != null && r !== '');
    const hasDuplicates =
      rankValues.length > 0 &&
      rankValues.length !== new Set(rankValues).size;

    if (!hasDuplicates) {
      // Case 1: All unique ranks – pass through
      return basePayload;
    }
    // Case 2: Duplicate ranks – resolve via reorder/shifting
    return this.reorderPayloadWithLockedRanks(basePayload);
  }

  /** Reorder payload so locked ranks are preserved and others are shifted around them. */
  private reorderPayloadWithLockedRanks(payload: PrioritizationPayload): PrioritizationPayload {
    const ideas = (payload.ideas as TARankingChange[]).map((item, index) => {
      const parsedRank = Number(item.ranking_franchise);
      return {
        idea_id: item.idea_id,
        oldRank: index + 1, // current position in array
        userRank: Number.isFinite(parsedRank) ? parsedRank : index + 1, // fallback to current position
        locked: item.lock === true,
      };
    });

    const maxUserRank = Math.max(
  ideas.length,
  ...ideas.map(i => i.userRank)
);

const N = maxUserRank

    // STEP 1: Clamp ranks to [1, N]
    ideas.forEach((item) => {
      item.userRank = Math.max(1, Math.min(N, item.userRank));
    });

    // STEP 2: Create empty slots
    const slots: Array<{
      idea_id: number;
      oldRank: number;
      userRank: number;
      locked: boolean;
    } | null> = new Array(N).fill(null);

    // STEP 3: Place locked items
    const lockedItems = ideas
      .filter((i) => i.locked)
      .sort((a, b) => a.userRank - b.userRank);

    for (const item of lockedItems) {
      let pos = item.userRank - 1;
      while (pos < N && slots[pos] !== null) {
        pos++;
      }
      if (pos < N) {
        slots[pos] = item;
      }
    }

    // STEP 4: Place unlocked items at their user-selected rank (shift right on collision, same as locked)
    const unlockedItems = ideas
      .filter((i) => !i.locked)
      .sort((a, b) => a.oldRank - b.oldRank);

    for (const item of unlockedItems) {
      let pos = item.userRank - 1;
      while (pos < N && slots[pos] !== null) {
        pos++;
      }
      if (pos < N) {
        slots[pos] = item;
      }
    }

    // STEP 5: Output unique ranks (slot position) after shifting; skip null slots
    const reorderedIdeas: TARankingChange[] = slots
      .flatMap((item, index) =>
        item === null ? [] : [{ idea_id: item.idea_id, ranking_franchise: String(index + 1), lock: item.locked }]
      );

    return {
      ideas: reorderedIdeas,
      locked: payload.locked,
      updated_by: payload.updated_by,
    };
  }

  submitRanking() {
    // Show confirmation popup before submission
    this.popup = PopupConfigs.submitRankingConfirmTwo;
    this.popup.open = true;
  }

  // Helper method to view current ranking changes (for debugging)
  getRankingChanges() {
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
        link.download = `prioritization_two_export_${new Date().getTime()}.xlsx`;
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

