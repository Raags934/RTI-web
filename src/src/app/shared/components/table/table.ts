import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';

import { Idea } from '../../../models/idea.model';
import { IdeaEventsService } from '../../../events/ideaServiceEvents';
import { HighlightPipe } from '../../pipes/highlight.pipe.js';
import { Buttons } from '../buttons/buttons';
import { statusColor } from '../../constants/statusColor';
import { Router } from '@angular/router';
import { RankingDropdown } from '../ranking-dropdown/ranking-dropdown';

export interface TableColumn {
  key: string; // property name in data
  label: string; // header label
  sortable?: boolean; // enable sorting
  width?: ColumnWidth;
}

export type ColumnWidth = 'xsmall' | 'small' | 'medium' | 'large';

@Component({
  selector: 'app-table',
  imports: [CommonModule, MatTableModule, MatIconModule, HighlightPipe, Buttons, RankingDropdown],
  templateUrl: './table.html',
  styleUrl: './table.scss',
})
export class Table {
  @Input() columns: TableColumn[] = [];
  @Input() dataSource: any[] = [];
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

  constructor(private ideaEvents: IdeaEventsService, private router: Router) {
    this.sub = this.ideaEvents.events$.subscribe((event) => {
      if (event.type === 'searchByText') {
        this.searchText = event.payload.searchText;
      }
    });
  }

  ngOnInit() {
    this.displayedColumns = this.columns.map(c => c.key);
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
    this.ideaEvents.sortByColumn(this.currentSortColumn, this.currentDirection);
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
 
      let value = tac ? `TAC: ${tac}` : rp ? `RP: ${rp}` : '';
 
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

  toggleOptionsMenu(event: Event, ideaUid: string) {
    event.stopPropagation();

    // Only allow on prioritization routes
    if (!this.isPrioritizationRoute()) {
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
 
  getStatusColor(statusId: number): string {
    const match = this.statusColor.find(s => s.status_id === statusId);
    return match ? match.color : 'gray'; // fallback color
  }

  viewIdea(key: any) {
    // Extract just the route path without query params
    const currentPath = this.router.url.split('?')[0];

    this.router.navigate(['/ideas/' + key], {
      queryParams: { from: currentPath }
    });
    this.closeOptionsMenu();
  }

viewIdeaHistory(key: any) {
    // Extract just the route path without query params
    const currentPath = this.router.url.split('?')[0];

    this.router.navigate(['/ideas/' + key + '/history'], {
      queryParams: { from: currentPath }
    });
    this.closeOptionsMenu();
  }

  onRankingChange(element: Idea, rank: number | null) {
    this.ideaEvents.rankingChanged(element.idea_id, rank?.toString() || null);
    element.ranking_brand = rank?.toString() || null;


    // Emit ranking change event to parent component
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


    // Emit ranking change event to parent component
  }

  getTARankingValue(element: Idea): number | null {
    if (!element.ranking_franchise) {
      return null;
    }
    const rank = parseInt(element.ranking_franchise, 10);
    return isNaN(rank) ? null : rank;
  }

  // Check if current route is TA prioritization page
  isTaPrioritizationRoute(): boolean {
    return this.router.url.includes('/ta-prioritization');
  }

  // Check if current route is any prioritization page
  isPrioritizationRoute(): boolean {
    return this.router.url.includes('/prioritization') || this.router.url.includes('/ta-prioritization');
  }

  // Check if element is in last 3 rows
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
