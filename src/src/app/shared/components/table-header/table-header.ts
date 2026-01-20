import { Component } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { IdeaEventsService } from '../../../events/ideaServiceEvents';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Buttons } from '../buttons/buttons';

@Component({
  selector: 'app-table-header',
  imports: [
    RouterModule,
    MatIconModule,
    MatDividerModule,
    FormsModule,
    CommonModule,
    Buttons,
  ],
  templateUrl: './table-header.html',
  styleUrl: './table-header.scss',
})
export class TableHeader {
  searchValue: string = '';

  constructor(private ideaEvent: IdeaEventsService) {
  }

  onSearch() {
    this.ideaEvent.searchByText(this.searchValue);
  }

  onReset() {
    this.searchValue = '';
    this.ideaEvent.searchByText(this.searchValue);
  }
}
