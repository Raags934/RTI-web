import { Component, Input } from '@angular/core';
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

export interface TableColumn {
  key: string; // property name in data
  label: string; // header label
  sortable?: boolean; // enable sorting
  width?: ColumnWidth;
}

export type ColumnWidth = 'xsmall' | 'small' | 'medium' | 'large';

@Component({
  selector: 'app-table',
  imports: [CommonModule, MatTableModule, MatIconModule, HighlightPipe,Buttons],
  templateUrl: './table.html',
  styleUrl: './table.scss',
})
export class Table {
  @Input() columns: TableColumn[] = [];
  @Input() dataSource: any[] = [];
  @Input() from: string = '';
  statusColor = statusColor;

  private sub!: Subscription;

  displayedColumns: string[] = [];

  searchText = '';
  // No column sorted initially
  private currentSortColumn: string | null = null;

  // No direction until the first click
  private currentDirection: 'asc' | 'desc' | null = null;

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

  onOptionsClick(element:any){
    // this.ideaEvents.openOptions(element);

  }
 
  getStatusColor(statusId: number): string {
    const match = this.statusColor.find(s => s.status_id === statusId);
    return match ? match.color : 'gray'; // fallback color
  }

  viewIdea(key:any) {
    this.router.navigate(['/ideas/'+key], { queryParams: { from: this.from } });
  }

 
 
 
}
