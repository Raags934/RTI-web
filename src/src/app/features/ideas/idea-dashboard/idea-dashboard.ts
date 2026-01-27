import { Component, OnInit } from '@angular/core';

import { AppState } from '../../../app.state.js';
import { Store, select } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { LoadIdeas } from '../../../store/idea.actions.js';
import { Idea, ExportIdeasPayload } from '../../../models/idea.model.js';
import { IdeaEventsService } from '../../../events/ideaServiceEvents.js';
import { IdeaService } from '../../../store/idea.service.js';
import { TableHeader } from '../../../shared/components/table-header/table-header.js';
import { Table, TableColumn } from '../../../shared/components/table/table.js';
import { HeaderFilter } from '../../../shared/components/header-filter/header-filter.js';
import { TableFilter } from '../../../shared/components/table-filter/table-filter.js';
import { Pagination } from '../../../shared/components/pagination/pagination.js';
import { StatusTab, creator } from '../../../shared/constants/statusTabs.js';
import { ideaDisplayColumns } from '../../../shared/constants/tableColumns.js';
import { loadMasterData } from '../../../store/masterData/masterData.actions.js';
import { IdeaHistory } from '../idea-history/idea-history';

@Component({
  selector: 'app-idea-dashboard',
  imports: [HeaderFilter, TableHeader, TableFilter, Table, Pagination, IdeaHistory],
  templateUrl: './idea-dashboard.html',
  styleUrl: './idea-dashboard.scss',
})
export class IdeaDashboard implements OnInit {
  userName: string = 'Karthik Perisetti';

  ideaDisplayColumns: TableColumn[] = ideaDisplayColumns;
  statusTabs: StatusTab[] = creator;
  showIdeaHistory: boolean = false;
  selectedIdeaId: number = 0;
  selectedIdeaUid: string = '';
  ideas$: Observable<Idea[]>;
  ideas: Idea[] = [];
  filteredIdeas: Idea[] = [];
  pagedIdeas: Idea[] = [];
  currentPage = 1;
  pageSize = 6;
  totalPages = 1;

  searchableKeys = ideaDisplayColumns.map((col) => col.key).filter((key) => key !== 'options');

  // Track active filter values
  private activeFilters = {
    franchise_id: null as number | null,
    ta_id: null as number | null,
    role_id: null as number | null,
    function_id: null as number | null,
  };

  private sub!: Subscription;

  constructor(
    private store: Store<AppState>,
    private ideaEvents: IdeaEventsService,
    private ideaService: IdeaService
  ) {
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
      // Set default TA filter and apply all filters
      this.activeFilters.ta_id = 3;
      this.applyAllFilters();
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
      }else if (event.type === 'taFilterChange') {
        this.taFilterChange(event.payload);
      } else if (event.type === 'franchiseFilterChange') {
        this.franchiseFilterChange(event.payload);
      } else if (event.type === 'roleFilterChange') {
        this.roleFilterChange(event.payload);
      } else if (event.type === 'functionFilterChange') {
        this.functionFilterChange(event.payload);
      } else if (event.type === 'exportData') {
        this.exportData();
      } else if (event.type === 'viewIdeaHistory') {
        this.selectedIdeaId = event.payload.idea_id;
        this.selectedIdeaUid = event.payload.idea_uid;
        this.showIdeaHistory = true;
      } else if (event.type === 'closeIdeaHistory') {
        this.showIdeaHistory = false;
        this.selectedIdeaId = 0;
        this.selectedIdeaUid = '';
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  taFilterChange(ta_id: number | null) {
    this.activeFilters.ta_id = ta_id;
    this.applyAllFilters();
  }

  franchiseFilterChange(franchise_id: number | null) {
    this.activeFilters.franchise_id = franchise_id;
    this.applyAllFilters();
  }

  roleFilterChange(role_id: number | null) {
    this.activeFilters.role_id = role_id;
    this.applyAllFilters();
  }

  functionFilterChange(function_id: number | null) {
    this.activeFilters.function_id = function_id;
    this.applyAllFilters();
  }

  // Apply all active filters in combination (AND logic)
  private applyAllFilters() {
    this.filteredIdeas = this.ideas.filter(idea => {
      // Apply franchise filter
      if (this.activeFilters.franchise_id !== null && idea.franchise_id !== this.activeFilters.franchise_id) {
        return false;
      }

      // Apply TA filter
      if (this.activeFilters.ta_id !== null && idea.ta_id !== this.activeFilters.ta_id) {
        return false;
      }

      // Apply role filter
      if (this.activeFilters.role_id !== null) {
        const hasRole = idea.created_by?.roles?.some(role => role.role_id === this.activeFilters.role_id);
        if (!hasRole) {
          return false;
        }
      }

      // Apply function filter
      if (this.activeFilters.function_id !== null) {
        const hasFunction = idea.created_by?.functions?.some(func => func.function_id === this.activeFilters.function_id);
        if (!hasFunction) {
          return false;
        }
      }

      return true;
    });

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

  exportData() {
    const payload: ExportIdeasPayload = {
      id: this.filteredIdeas.map(idea => idea.idea_id)
    };

    this.ideaService.exportIdeas(payload).subscribe({
      next: (base64Data: string) => {
        try {
          console.log('✅ API Response received');
          console.log('📦 Response type:', typeof base64Data);
          console.log('📏 Response length:', base64Data?.length);
          console.log('🔍 First 100 chars:', base64Data?.substring(0, 100));
          
          // Validate response
          if (!base64Data) {
            throw new Error('Empty response received from server');
          }

          if (typeof base64Data !== 'string') {
            console.error('❌ Invalid response type. Expected string, got:', typeof base64Data);
            console.error('📦 Full response:', base64Data);
            throw new Error(`Invalid response type: ${typeof base64Data}. Expected string.`);
          }

          // Check if it's valid base64
          const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
          const cleanBase64 = base64Data.trim();
          if (!base64Regex.test(cleanBase64)) {
            console.warn('⚠️ Response may not be valid base64. Attempting to decode anyway...');
            console.log('🔍 Response sample:', cleanBase64.substring(0, 200));
          }

          // Decode base64 string
          console.log('🔄 Decoding base64...');
          let binaryString: string;
          try {
            binaryString = atob(cleanBase64);
            console.log('✅ Base64 decoded successfully');
            console.log('📏 Binary string length:', binaryString.length);
          } catch (decodeError) {
            console.error('❌ Base64 decode error:', decodeError);
            throw new Error(`Failed to decode base64: ${decodeError}`);
          }

          // Convert to bytes
          console.log('🔄 Converting to bytes...');
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          console.log('✅ Bytes array created. Length:', bytes.length);
          
          // Create blob and trigger download
          console.log('🔄 Creating blob...');
          const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          console.log('✅ Blob created. Size:', blob.size, 'bytes');
          
          if (blob.size === 0) {
            throw new Error('Blob size is 0. Invalid file data.');
          }

          console.log('🔄 Creating object URL...');
          const url = window.URL.createObjectURL(blob);
          console.log('✅ Object URL created:', url);

          console.log('🔄 Creating download link...');
          const link = document.createElement('a');
          link.href = url;
          const fileName = `ideas_export_${new Date().getTime()}.xlsx`;
          link.download = fileName;
          link.style.display = 'none';
          
          console.log('🔄 Appending link to DOM...');
          document.body.appendChild(link);
          
          console.log('🔄 Triggering download...');
          link.click();
          
          console.log('🔄 Cleaning up...');
          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            console.log('✅ Download completed and cleaned up');
          }, 100);

        } catch (error) {
          console.error('❌ Error in export process:', error);
          console.error('📋 Error details:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
          });
          alert(`Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}. Please check console for details.`);
        }
      },
      error: (error) => {
        console.error('❌ API Error exporting data:', error);
        console.error('📋 Error details:', {
          status: error?.status,
          statusText: error?.statusText,
          message: error?.message,
          error: error?.error,
          url: error?.url
        });
        
        let errorMessage = 'Failed to export data. Please try again.';
        if (error?.status) {
          errorMessage += ` (Status: ${error.status})`;
        }
        if (error?.message) {
          errorMessage += ` - ${error.message}`;
        }
        alert(errorMessage);
      }
    });
  }
}
