import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { IdeaService } from '../../../store/idea.service';
import { IdeaEventsService } from '../../../events/ideaServiceEvents';


@Component({
  selector: 'app-table-filter',
  imports: [CommonModule, MatIconModule, MatTabsModule,MatDividerModule, RouterModule],
  templateUrl: './table-filter.html',
  styleUrl: './table-filter.scss',
})
export class TableFilter implements OnChanges {
  @Input() tabs: any[] = [];
  /** When set, syncs active tab with the tab that has this status_id (e.g. after save ranking). */
  @Input() activeStatusId: number | null = null;
  activeTab: string = "All";

  constructor(private ideaEvents: IdeaEventsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeStatusId'] && this.tabs?.length) {
      const tab = this.tabs.find((t: any) => t.status_id === this.activeStatusId);
      this.activeTab = tab ? tab.label : (this.activeStatusId === 0 ? 'All' : this.activeTab);
    }
  }

  selectTab(tab: any) {
    console.log(this.tabs)
    console.log(this.activeTab)
    this.activeTab = tab.label;
    // publish event globally
    this.ideaEvents.applyFilterByStatus(tab.status_id);
  }

 
}
