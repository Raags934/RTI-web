import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { Idea, IdeaPayload } from '../../../models/idea.model';
import { IdeaEventsService } from '../../../events/ideaServiceEvents';
import { HighlightPipe } from '../../pipes/highlight.pipe.js';
import { Buttons } from '../buttons/buttons';
import { statusColor } from '../../constants/statusColor';
import { Router } from '@angular/router';
import { RankingDropdown } from '../ranking-dropdown/ranking-dropdown';
import { Store } from '@ngrx/store';
import { AppState } from '../../../app.state.js';
import { DeleteIdea, AddDraftIdea } from '../../../store/idea.actions.js';

export interface TableColumn {
  key: string; // property name in data
  label: string; // header label
  sortable?: boolean; // enable sorting
  width?: ColumnWidth;
}

export type ColumnWidth = 'xsmall' | 'small' | 'medium' | 'large';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, HighlightPipe, Buttons, RankingDropdown],
  templateUrl: './table.html',
  styleUrl: './table.scss',
})
export class Table {
  @Input() columns: TableColumn[] = [];
  @Input() dataSource: any[] = [];
  /** Legacy input from earlier version; kept for compatibility but not used. */
  @Input() from: string = '';
  @Input() currentFilterStatusId: number = 0; // Current filter status_id for pending filter detection
  /** When true, "View Idea Details" opens overlay instead of navigating to full page. */
  @Input() useViewIdeaOverlay = false;
  statusColor = statusColor;

  private sub!: Subscription;

  displayedColumns: string[] = [];

  searchText = '';
  // No column sorted initially
  private currentSortColumn: string | null = null;

  // No direction until the first click
  private currentDirection: 'asc' | 'desc' | null = null;

  // Options menu state
  openOptionsMenuId: string | null = null;

  constructor(
    private ideaEvents: IdeaEventsService,
    private router: Router,
    private store: Store<AppState>
  ) {
    this.sub = this.ideaEvents.events$.subscribe((event) => {
      if (event.type === 'searchByText') {
        this.searchText = event.payload.searchText;
      }
    });
  }

  ngOnInit() {
    this.displayedColumns = this.columns.map((c) => c.key);
  }

  onSort(column: string) {
    if (this.currentSortColumn === column) {
      // Toggle if clicking the same column
      this.currentDirection = this.currentDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // New column → start at asc
      this.currentSortColumn = column;
      this.currentDirection = 'asc';
    }

    // Raise global sort event
    this.ideaEvents.sortByColumn(this.currentSortColumn, this.currentDirection || 'asc');
  }

  getDirection(column: string): 'asc' | 'desc' | null {
    // Only show icon for the active column
    return this.currentSortColumn === column ? this.currentDirection : null;
  }

  getValue(obj: any, path: string): any {
    // Special merged TAC/RP column
    if (path === 'TAC_or_RP') {
      const tac = obj?.target_aspirational_claim;
      const rp = obj?.research_proposal;

      const value = tac ? `TAC: ${tac}` : rp ? `RP: ${rp}` : '';

      return value && value.trim() !== '' ? value : '.....';
    }

    // Default nested resolver
    const value = path.split('.').reduce((acc, part) => acc?.[part], obj);

    // Global rule: if empty → return "....."
    if (value === null || value === undefined || value === '') {
      return '.....';
    }

    return value;
  }

  // ----- Options menu + navigation -----

  toggleOptionsMenu(event: Event, ideaUid: string) {
    event.stopPropagation();

    // Allow dropdown on prioritization, idea-dashboard, and admin routes
    if (!this.isPrioritizationRoute() && !this.isIdeaDashboardRoute() && !this.isAdminRoute()) {
      this.viewIdea(ideaUid);
      return;
    }

    if (this.openOptionsMenuId === ideaUid) {
      this.openOptionsMenuId = null;
    } else {
      this.openOptionsMenuId = ideaUid;
    }
  }

  closeOptionsMenu() {
    this.openOptionsMenuId = null;
  }

  isOptionsMenuOpen(ideaUid: string): boolean {
    return this.openOptionsMenuId === ideaUid;
  }

  // ----- Status helpers -----

  getStatusColor(statusId: number): string {
    // Special handling: status_id 12 is used for both "Product Ranked" and "TA Prioritization Pending"
    // On TA prioritization route, status_id 12 should use caution-300 (same as Product Prioritization Pending)
    if (statusId === 12 && this.isTaPrioritizationRoute()) {
      return 'var(--caution-300)';
    }

    const match = this.statusColor.find((s) => s.status_id === statusId);
    return match ? match.color : 'gray'; // fallback color
  }

  // Check if current filter is a pending status based on the component/route
  // Prioritization One: status_id 11 = Product Prioritization Pending
  // Prioritization Two: status_id 12 = TA Prioritization Pending
  isPendingFilter(): boolean {
    if (this.isPrioritizationOneRoute()) {
      // In Prioritization One, only status_id 11 is "Product Prioritization Pending"
      return this.currentFilterStatusId === 11;
    } else if (this.isTaPrioritizationRoute()) {
      // In Prioritization Two, status_id 12 is "TA Prioritization Pending"
      return this.currentFilterStatusId === 12;
    }
    // For other components (idea-dashboard, etc.), never show pending_with
    return false;
  }

  // Get status display value - show pending_with if in pending filter mode, otherwise show status_name
  getStatusDisplayValue(element: any): string {
    if (this.isPendingFilter() && element?.status?.pending_with) {
      return element.status.pending_with;
    }
    return element?.status?.status_name || '.....';
  }

  // ----- Route helpers -----

  // Check if current route is Prioritization One page
  isPrioritizationOneRoute(): boolean {
    return (
      this.router.url.includes('/prioritization') &&
      !this.router.url.includes('/ta-prioritization')
    );
  }

  // Check if current route is TA prioritization page
  isTaPrioritizationRoute(): boolean {
    return this.router.url.includes('/ta-prioritization');
  }

  // Check if current route is any prioritization page
  isPrioritizationRoute(): boolean {
    return (
      this.router.url.includes('/prioritization') || this.router.url.includes('/ta-prioritization')
    );
  }

  // Check if current route is idea-dashboard page
  isIdeaDashboardRoute(): boolean {
    const path = this.router.url.split('?')[0];
    return path === '/' || path === '';
  }

  // Check if current route is admin home page
  isAdminRoute(): boolean {
    const path = this.router.url.split('?')[0];
    return path === '/admin' || path.startsWith('/admin/');
  }

  // ----- Idea actions -----

  viewIdea(arg: any) {
    let ideaUid: string;
    let statusLabel: string | null = null;

    if (typeof arg === 'string') {
      ideaUid = arg;
    } else {
      ideaUid = arg?.idea_uid;
      statusLabel = this.getStatusDisplayValue(arg);
    }

    if (this.useViewIdeaOverlay) {
      this.ideaEvents.viewIdeaOverlay(ideaUid, statusLabel ?? undefined);
      this.closeOptionsMenu();
      return;
    }

    const currentPath = this.router.url.split('?')[0];
    const queryParams: any = { from: currentPath };
    if (statusLabel) {
      queryParams.statusLabel = statusLabel;
    }
    this.router.navigate(['/ideas/' + ideaUid], { queryParams });
    this.closeOptionsMenu();
  }

  viewIdeaHistory(element: Idea) {
    if (element && element.idea_id) {
      this.ideaEvents.viewIdeaHistory(element.idea_id, element.idea_uid);
      this.closeOptionsMenu();
    }
  }

  /** Used only on admin route (More Options → Reset Idea). Other pages unchanged. */
  resetIdea(element: Idea) {
    if (element && element.idea_id) {
      this.ideaEvents.resetIdea(element.idea_id, element.idea_uid);
      this.closeOptionsMenu();
    }
  }

  editIdea(ideaUid: string) {
    const currentPath = this.router.url.split('?')[0];
    this.router.navigate(['/ideas/' + ideaUid + '/edit'], {
      queryParams: { from: currentPath },
    });
    this.closeOptionsMenu();
  }

  duplicateIdea(idea: Idea) {
    if (!idea) {
      console.error('Idea not found');
      this.closeOptionsMenu();
      return;
    }

    // Get user from store to set created_by
    this.store
      .select((state) => state.masterData?.data?.user)
      .pipe(take(1))
      .subscribe((user) => {
        // Convert Idea to IdeaPayload
        const payload: IdeaPayload = {
          pathway_id: idea.pathway_id,
          rti_year: idea.rti_year,
          product_type: idea.product_type,
          product_id: idea.product_id,
          brand_id: idea.brand_id,
          ta_id: idea.ta_id,
          franchise_id: idea.franchise_id,
          origin_request: idea.origin_request,
          strategic_rationale: idea.strategic_rationale,
          monadic_or_comparative: idea.monadic_or_comparative,
          target_aspirational_claim: idea.target_aspirational_claim,
          research_proposal: idea.research_proposal || '',
          launch_claim: idea.launch_claim,
          created_by: user?.user_id || idea.created_by?.user_id || 1,
          updated_by: user?.user_id || idea.updated_by?.user_id || 1,
        };

        // Dispatch AddDraftIdea action
        this.store.dispatch(AddDraftIdea({ idea: payload }));
        this.closeOptionsMenu();
      });
  }

  deleteIdea(element: Idea) {
    if (confirm(`Are you sure you want to delete idea ${element.idea_uid}?`)) {
      this.store.dispatch(DeleteIdea({ ideaId: element.idea_id }));
      this.closeOptionsMenu();
    }
  }

  // ----- Ranking helpers -----

  onRankingChange(element: Idea, rank: number | null) {
    this.ideaEvents.rankingChanged(element.idea_id, rank?.toString() || null);
    element.ranking_brand = rank?.toString() || null;
  }

  getRankingValue(element: Idea): number | null {
    if (!element.ranking_brand) {
      return null;
    }
    const rank = parseInt(element.ranking_brand, 10);
    return isNaN(rank) ? null : rank;
  }

  onTaRankingChange(element: Idea, rank: number | null) {
    this.ideaEvents.rankingTaChanged(element.idea_id, rank?.toString() || null);
    element.ranking_franchise = rank?.toString() || null;
  }

  getTARankingValue(element: Idea): number | null {
    if (!element.ranking_franchise) {
      return null;
    }
    const rank = parseInt(element.ranking_franchise, 10);
    return isNaN(rank) ? null : rank;
  }

  // Check if element is in last 3 rows (for options menu position)
  isNearBottom(element: any): boolean {
    const index = this.dataSource.indexOf(element);
    return index >= this.dataSource.length - 3;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Close options menu when clicking outside
    if (this.openOptionsMenuId) {
      this.closeOptionsMenu();
    }
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}

