import { Component, Input } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { IdeaEventsService } from '../../../events/ideaServiceEvents';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Buttons } from '../buttons/buttons';

@Component({
  selector: 'app-table-header',
  standalone: true,
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
  // Heading and caption
  @Input() title: string = 'Ideas List';
  @Input() caption: string = 'Your latest research proposals and ideas';

  searchValue: string = '';

  // Whether to show search box
  @Input() showSearch: boolean = true;

  // Whether to show "New Idea" button (with safe default + setter)
  private _showNewIdea: boolean = true;
  @Input()
  set showNewIdea(value: boolean) {
    this._showNewIdea = value !== undefined ? value : true;
  }
  get showNewIdea(): boolean {
    return this._showNewIdea;
  }
  @Input() exportVariant: 'type1' | 'type2' = 'type2';
  @Input() exportColor: string = 'var(--primary-300)';
  @Input() exportSize: 'xsmall' | 'small' | 'medium' | 'large' = 'medium';
  @Input() exportIcon: string = 'ios_share';

  constructor(private ideaEvent: IdeaEventsService) {
  }

  onSearch() {
    this.ideaEvent.searchByText(this.searchValue);
  }

  onReset() {
    this.searchValue = '';
    this.ideaEvent.searchByText(this.searchValue);
  }

  onExportClick() {
    this.ideaEvent.exportData();
  }
}
