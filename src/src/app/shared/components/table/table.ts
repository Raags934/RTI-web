import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
import { User } from '../../../models/user.model';

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
  imports: [CommonModule, MatTableModule, MatIconModule, MatCheckboxModule, HighlightPipe, Buttons, RankingDropdown],
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
  @Input() showFreezeButton: boolean = false;
  @Input() dropdownStyle: string = '';
  @Input() showCheckboxColumn = false;
  @Input() selectedIdeaIds: number[] = [];
  @Output() selectedIdeaIdsChange = new EventEmitter<number[]>();

  private sub!: Subscription;
  private userSub!: Subscription;
  private currentUser: User | null = null;

  get displayedColumns(): string[] {
    return this.showCheckboxColumn
      ? ['checkbox', ...this.columns.map((c) => c.key)]
      : this.columns.map((c) => c.key);
  }

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

    // Keep current user in sync for conditional TAC/RP display on idea dashboard
    this.userSub = this.store
      .select((state) => state.masterData?.data?.user as User | undefined)
      .subscribe((user) => {
        this.currentUser = user ?? null;
      });
  }

  ngOnInit() { }

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
      let value = '';

      // On idea dashboard (landing page), TAC/RP display is driven by user function:
      // - Evidence Function only: show RP
      // - Business Function only: show TAC
      // - Both Evidence + Business: show both "TAC: ..., RP: ..."
      if (this.isIdeaDashboardRoute() && this.currentUser?.functions) {
        const functions = this.currentUser.functions || [];
        const hasEvidenceFunction = functions.some(
          (f) => f.function_type === 'Evidence Function'
        );
        const hasBusinessFunction = functions.some(
          (f) => f.function_type === 'Business Function'
        );

        if (hasEvidenceFunction && hasBusinessFunction) {
          const parts: string[] = [];
          if (tac) {
            parts.push(`TAC: ${tac}`);
          }
          if (rp) {
            parts.push(`RP: ${rp}`);
          }
          value = parts.join(', ');
        } else if (hasEvidenceFunction && !hasBusinessFunction) {
          value = rp ? `RP: ${rp}` : '';
        } else if (hasBusinessFunction && !hasEvidenceFunction) {
          value = tac ? `TAC: ${tac}` : '';
        } else {
          // Fallback to legacy behavior if user has no matching functions
          value = tac ? `TAC: ${tac}` : rp ? `RP: ${rp}` : '';
        }
      } else {
        // Legacy behavior for all non-idea-dashboard routes
        value = tac ? `TAC: ${tac}` : rp ? `RP: ${rp}` : '';
      }

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

    // Allow dropdown on prioritization, idea-dashboard, harmonizer, admin, and funding routes
    if (!this.isPrioritizationRoute() && !this.isIdeaDashboardRoute() && !this.isAdminRoute() && !this.isHarmonizerRoute() && !this.isFunderRoute()) {
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

    // Special handling: status_id 13 is Funding Pending
    // Only show orange (caution-300) when viewing Funding Pending filter in Funding route
    // Otherwise, TA Ranked or other statuses with status_id 13 will show their actual color
    if (statusId === 13 && this.isFunderRoute() && this.currentFilterStatusId === 13) {
      return 'var(--caution-300)';
    }

    // Harmonizer route only: use same colors as prioritization (no change to prioritization one)
    // Harmonization Pending (18) = Product Prioritization Pending (10) color; Harmonized (10) = Product Ranked (12) color
    if (this.isHarmonizerRoute()) {
      if (statusId === 18) {
        const match = this.statusColor.find((s) => s.status_id === 10);
        return match ? match.color : 'gray';
      }
      if (statusId === 10) {
        const match = this.statusColor.find((s) => s.status_id === 12);
        return match ? match.color : 'gray';
      }
    }

    const match = this.statusColor.find((s) => s.status_id === statusId);
    return match ? match.color : 'gray'; // fallback color
  }

  // Check if current filter is a pending status based on the component/route
  // Prioritization One: status_id 10 = Product Prioritization Pending
  // Prioritization Two: status_id 12 = TA Prioritization Pending
  // Harmonizer: status_id 18 = Harmonization Pending
  // Funding: status_id 13 = Funding Pending (show pending_with)
  isPendingFilter(): boolean {
    if (this.isHarmonizerRoute()) {
      return this.currentFilterStatusId === 18;
    }
    if (this.isPrioritizationOneRoute()) {
      return this.currentFilterStatusId === 10;
    }
    if (this.isTaPrioritizationRoute()) {
      return this.currentFilterStatusId === 12;
    }
    if (this.isFunderRoute()) {
      return this.currentFilterStatusId === 13;
    }
    return false;
  }

  // Get status display value - show pending label if in pending filter mode, otherwise show status_name
  getStatusDisplayValue(element: any): string {
    if (this.isHarmonizerRoute() && this.currentFilterStatusId === 18) {
      return 'Harmonization pending';
    }
    // Product Prioritization Pending tab (prioritization-one, status_id 10): show pending_with, fallback to "Product Ranking"
    if (this.isPrioritizationOneRoute() && this.currentFilterStatusId === 10) {
      return element?.status?.pending_with || 'Product Ranking';
    }
    // Funding Pending tab (funding, status_id 13): show pending_with, fallback to "Funding Pending"
    if (this.isFunderRoute() && this.currentFilterStatusId === 13) {
      return 'Funding Pending';
    }
    // TA Prioritization Pending and other pending filters: show pending_with when present
    if (this.isPendingFilter() && element?.status?.pending_with) {
      return element.status.pending_with;
    }
    return element?.status?.status_name || '.....';
  }

  // ----- Route helpers -----

  // Check if current route is Prioritization One (Product Prioritization) page
  // Route path is 'productprioritization' so url is e.g. /productprioritization
  isPrioritizationOneRoute(): boolean {
    const url = this.router.url;
    return url.includes('productprioritization') || (url.includes('/prioritization') && !url.includes('ta-prioritization') && !url.includes('taprioritization'));
  }

  // Check if current route is TA prioritization page
  isTaPrioritizationRoute(): boolean {
    const url = this.router.url;
    // Support both historical '/ta-prioritization' and current '/taprioritization' paths
    return url.includes('/ta-prioritization') || url.includes('/taprioritization');
  }

  // Check if current route is any prioritization page
  isPrioritizationRoute(): boolean {
    const url = this.router.url;
    // Support product prioritization (`/productprioritization`) and TA prioritization (`/taprioritization`),
    // as well as any legacy `/prioritization` paths.
    return (
      url.includes('productprioritization') ||
      url.includes('/prioritization') ||
      url.includes('/taprioritization')
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

  // Check if current route is harmonizer page
  isHarmonizerRoute(): boolean {
    const path = this.router.url.split('?')[0];
    return path === '/harmonizer';
  }

  // ----- Checkbox selection (for funding Freeze Data) -----

  isSelected(ideaId: number): boolean {
    return this.selectedIdeaIds.indexOf(ideaId) !== -1;
  }

  toggleSelection(ideaId: number) {
    const set = new Set(this.selectedIdeaIds);
    if (set.has(ideaId)) {
      set.delete(ideaId);
    } else {
      set.add(ideaId);
    }
    this.selectedIdeaIdsChange.emit(Array.from(set));
  }

  isAllSelected(): boolean {
    if (!this.dataSource?.length) return false;
    return this.dataSource.every((row: Idea) => this.selectedIdeaIds.indexOf(row.idea_id) !== -1);
  }

  toggleSelectAll() {
    if (this.isAllSelected()) {
      const onPage = new Set(this.dataSource.map((row: Idea) => row.idea_id));
      this.selectedIdeaIdsChange.emit(this.selectedIdeaIds.filter((id: number) => !onPage.has(id)));
    } else {
      const onPage = this.dataSource.map((row: Idea) => row.idea_id);
      const merged = new Set([...this.selectedIdeaIds, ...onPage]);
      this.selectedIdeaIdsChange.emit(Array.from(merged));
    }
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

  editIdea(idea: Idea) {
    if (!idea?.idea_uid) return;
    const currentPath = this.router.url.split('?')[0];
    // Draft ideas (status_id === 1) open draft-specific edit page with Cancel, Save as Draft, Submit
    const isDraft = idea.status_id === 1;
    const editPath = isDraft ? '/ideas/' + idea.idea_uid + '/edit-draft' : '/ideas/' + idea.idea_uid + '/edit';
    this.router.navigate([editPath], {
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
        // Calculate approved based on user roles and functions
        // approved is true if user has role_name = "Creator" AND function_type = "Business Function" AND function_name = "Franchise"
        let approved = false;
        if (user?.roles && user?.functions) {
          const hasCreatorRole = user.roles.some(
            (role) => role.role_name === 'Creator/Approver'
          );
          const hasFranchiseBusinessFunction = user.functions.some(
            (func) => func.function_type === 'Business Function' && func.function_name === 'Franchise'
          );
          approved = hasCreatorRole && hasFranchiseBusinessFunction;
        }

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
          approved: approved,
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

  // Check if current route is funding page
  isFunderRoute(): boolean {
    return this.router.url.includes('/funding');
  }

  // Check if ranking columns should be disabled based on funding status
  // Returns true when on funding route AND status is Funding Pending (13), Funded (14), Unfunded (15), or Abandoned (4)
  shouldDisableRanking(): boolean {
    if (!this.isFunderRoute()) {
      return false;
    }
    // Disable ranking when status is: Funding Pending (13), Funded (14), Unfunded (15), or Abandoned (4)
    const disabledStatuses = [13, 14, 15, 4];
    return disabledStatuses.includes(this.currentFilterStatusId);
  }
 
  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}

