import { Component, Input } from '@angular/core';
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
export class TableFilter {
  @Input() tabs: any[] = [];
  activeTab: string = "All";

  constructor(private ideaEvents: IdeaEventsService) {}

  selectTab(tab: any) {
    console.log(this.tabs)
    console.log(this.activeTab)
    this.activeTab = tab.label;
    // publish event globally
    this.ideaEvents.applyFilterByStatus(tab.status_id);
  }

 
}
