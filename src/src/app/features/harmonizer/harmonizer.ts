import { Component, OnInit } from '@angular/core';

import { AppState } from '../../app.state.js';
import { Store, select } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { LoadIdeas } from '../../store/idea.actions.js';
import { Idea } from '../../models/idea.model.js';
import { IdeaEventsService } from '../../events/ideaServiceEvents.js';
import { TableHeader } from '../../shared/components/table-header/table-header.js';
import { Table, TableColumn } from '../../shared/components/table/table.js';
import { HeaderFilter } from '../../shared/components/header-filter/header-filter.js';
import { TableFilter } from '../../shared/components/table-filter/table-filter.js';
import { Pagination } from '../../shared/components/pagination/pagination.js';
import { StatusTab, creator, harmonizer } from '../../shared/constants/statusTabs.js';
import { ideaDisplayColumns } from '../../shared/constants/tableColumns.js';
import { loadMasterData } from '../../store/masterData/masterData.actions.js';

@Component({
  selector: 'app-harmonizer',
  imports: [HeaderFilter, TableHeader, TableFilter, Table, Pagination],
  templateUrl: './harmonizer.html',
  styleUrl: './harmonizer.scss',
})
export class Harmonizer implements OnInit {
  userName: string = 'Karthik Perisetti';

  ideaDisplayColumns: TableColumn[] = ideaDisplayColumns;
  statusTabs: StatusTab[] = harmonizer;
  ideas$: Observable<Idea[]>;
  ideas: Idea[] = [];
  filteredIdeas: Idea[] = [];
  pagedIdeas: Idea[] = [];
  currentPage = 1;
  pageSize = 6;
  totalPages = 1;

  searchableKeys = ideaDisplayColumns.map((col) => col.key).filter((key) => key !== 'options');

  private sub!: Subscription;

  constructor(private store: Store<AppState>, private ideaEvents: IdeaEventsService) {
    this.ideas$ = this.store.select((state) => state.ideas);
  }

  ngOnInit(): void {
    this.ideas$.pipe(take(1)).subscribe((ideas) => {
      if (!ideas || ideas.length === 0) {
        this.store.dispatch(LoadIdeas());
      }
    });

    this.ideas$.subscribe((ideas) => {
      this.ideas = ideas;
      this.taFilterChange(3);
      this.totalPages = Math.ceil(this.filteredIdeas.length / this.pageSize);
      this.updatePagedIdeas();
      this.updateStatusCounts();
    });

    this.sub = this.ideaEvents.events$.subscribe((event) => {
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
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  taFilterChange(ta_id: number | null) {
    if (ta_id == null) {
      this.filteredIdeas = [...this.ideas];
    } else {
      this.filteredIdeas = this.ideas.filter((idea) => idea.ta_id === ta_id);
    }
 
    this.totalPages = Math.ceil(this.filteredIdeas.length / this.pageSize);
    this.currentPage = 1;
    this.updatePagedIdeas();
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
}
