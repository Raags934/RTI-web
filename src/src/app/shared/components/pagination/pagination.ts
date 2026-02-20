import { Component, Input } from '@angular/core';
import { IdeaEventsService } from '../../../events/ideaServiceEvents'
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class Pagination {
  @Input() totalPages: number = 1;
  @Input() currentPage: number = 1;

  constructor(private ideaEvents: IdeaEventsService) {}

  get paginationItems(): (number | 'ellipsis')[] {
    const items: (number | 'ellipsis')[] = [];

    if (this.totalPages <= 6) {
      for (let i = 1; i <= this.totalPages; i++) items.push(i);
      return items;
    }

    // Always show pages 1..5
    for (let i = 1; i <= 5; i++) items.push(i);

    // Ellipsis if there are more pages
    if (this.totalPages > 6) {
      items.push('ellipsis');
    }

    // Always show last page
    items.push(this.totalPages);

    return items;
  }

  prev() {
    if (this.currentPage > 1) {
      const newPage = this.currentPage - 1;
      this.ideaEvents.changePage(newPage); // 🔗 raise event
    }
  }

  next() {
    if (this.currentPage < this.totalPages) {
      const newPage = this.currentPage + 1;
      this.ideaEvents.changePage(newPage); // 🔗 raise event
    }
  }

  selectPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.ideaEvents.changePage(page); // 🔗 raise event
    }
  }
}
