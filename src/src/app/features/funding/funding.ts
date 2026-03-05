import { Component, OnInit, NO_ERRORS_SCHEMA, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AppState } from '../../app.state';
import { Store } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

import { LoadIdeas } from '../../store/idea.actions';
import { Idea, ExportIdeasPayload } from '../../models/idea.model';
import { IdeaEventsService } from '../../events/ideaServiceEvents';
import { IdeaService } from '../../store/idea.service';
import { AuthService } from '../../core/services/auth.service';
import { TableHeader } from '../../shared/components/table-header/table-header';
import { Table, TableColumn } from '../../shared/components/table/table';
import { HeaderFilter } from '../../shared/components/header-filter/header-filter';
import { TableFilter } from '../../shared/components/table-filter/table-filter';
import { Pagination } from '../../shared/components/pagination/pagination';
import { PopUp } from '../../shared/components/popup/popup';
import { FormInput } from '../../shared/components/form-input/form-input';
import { Buttons } from '../../shared/components/buttons/buttons';
import { StatusTab, funding } from '../../shared/constants/statusTabs';
import { ideaDisplayColumns, fundingDisplayColumns } from '../../shared/constants/tableColumns';
import { PopupConfigs } from '../../shared/constants/popUp';
import { IdeaHistory } from '../ideas/idea-history/idea-history';
import { ViewIdeaOverlay } from '../ideas/view-idea-overlay/view-idea-overlay';

@Component({
  selector: 'app-funding',
  imports: [HeaderFilter, TableHeader, TableFilter, Table, Pagination, PopUp, FormInput, ReactiveFormsModule, IdeaHistory, ViewIdeaOverlay],
  templateUrl: './funding.html',
  styleUrl: './funding.scss',
})
export class Funding implements OnInit {
    // ...existing code...
    // Add ViewChild for TableFilter
    @ViewChild('tableFilter') tableFilterComponent: any;
  userName: string = 'Karthik Perisetti';

  // View Idea Overlay state variables
  showViewIdeaOverlay = false;
  overlayIdeaUid: string | null = null;
  overlayStatusLabel: string | null = null;

  // View Idea History state variables
  showIdeaHistory = false;
  selectedIdeaId: number = 0;
  selectedIdeaUid: string = '';


  get ideaDisplayColumns(): TableColumn[] {
  if (this.currentFilterStatusId === 0) {
    // Remove "selected", "ranking_brand", and "ranking_franchise" columns when on "All" tab
    return fundingDisplayColumns.filter(col =>
      col.key !== 'selected' &&
      col.key !== 'ranking_brand' &&
      col.key !== 'ranking_franchise'
    );
  }
  return fundingDisplayColumns;
}

  statusTabs: StatusTab[] = funding;
  ideas$: Observable<Idea[]>;
  ideas: Idea[] = [];
  filteredIdeas: Idea[] = [];
  pagedIdeas: Idea[] = [];
  currentPage = 1;
  pageSize = 6;
  totalPages = 1;
  currentFilterStatusId: number = 0;

  /** Selected idea_id values for Freeze Data (bulk funding). */
  selectedIdeaIds: number[] = [];

  /** Popup configuration from popUp.ts */
  updateFundingPopup = PopupConfigs.updateFundingStatus;

  /** Form for Update funding status popup (Funding status, Funding source, Comment). */
  fundingForm!: FormGroup;
 
  /** Options for Funding source dropdown (from GET dropdown_values, type Funding Source). */
  fundingSourceOptions: { value_id: number; value_label: string }[] = [];
  /** Stable options for Funding source select (id = value_id, name = value_label). */
  fundingSourceSelectOptions: { id: number; name: string }[] = [];
 
  /** Funding status dropdown options. */
  fundingStatusOptions = [
    { id: 'Funded', name: 'Funded' },
    { id: 'Unfunded', name: 'Unfunded' },
    { id: 'Abandoned', name: 'Abandoned' },
  ];

  searchableKeys = ideaDisplayColumns.map((col) => col.key).filter((key) => key !== 'options');

  private sub!: Subscription;

  /** Current active TA and Franchise filters for this page. */
  private activeTaId: number | null = null;
  private activeFranchiseId: number | null = null;

  constructor(
    private store: Store<AppState>,
    private ideaEvents: IdeaEventsService,
    private ideaService: IdeaService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.ideas$ = this.store.select((state) => state.ideas);
    this.fundingForm = this.fb.group({
      funding_status: new FormControl<string | null>(null, Validators.required),
      funding_source_value_id: new FormControl<number | null>(null),
      funding_comment: new FormControl<string>(''),
    });
  }

  ngOnInit(): void {
    this.ideas$.pipe(take(1)).subscribe((ideas) => {
      if (!ideas || ideas.length === 0) {
        this.store.dispatch(LoadIdeas());
      }
    });

    // Subscribe to query params to handle navigation from idea-view with status param
    this.route.queryParams.subscribe(params => {
      const statusParam = params['status'];
      if (statusParam) {
        const statusId = parseInt(statusParam, 10);
        if (!isNaN(statusId) && statusId !== this.currentFilterStatusId) {
          this.currentFilterStatusId = statusId;
          this.filterByStatus(statusId);
        }
      }
    });

    // Subscribe to funding_status changes to clear and disable funding source when Unfunded or Abandoned is selected
    this.fundingForm.get('funding_status')?.valueChanges.subscribe((status: string) => {
      const sourceControl = this.fundingForm.get('funding_source_value_id');
      if (status === 'Unfunded' || status === 'Abandoned') {
        this.fundingForm.patchValue({ funding_source_value_id: null });
        sourceControl?.disable({ emitEvent: false });
      } else {
        sourceControl?.enable({ emitEvent: false });
      }
    });

    this.ideas$.subscribe((ideas) => {
      this.ideas = ideas;

      // If TA/Franchise are already selected in header filter (auto-populated),
      // apply them so funding list matches the visible filters.
      if (this.currentFilterStatusId === 0) {
        this.filteredIdeas = [...this.ideas];
      } else {
        this.filteredIdeas = this.ideas.filter((i) => i.status_id === this.currentFilterStatusId);
      }

      this.activeTaId = this.ideaEvents.getCurrentTaId();
      this.activeFranchiseId = this.ideaEvents.getCurrentFranchiseId();
      this.applyActiveFilters();

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
      } else if (event.type === 'freezeData') {
        this.loadFundingSourceOptions();
        this.fundingForm.reset();
        // Enable funding source control when popup opens
        this.fundingForm.get('funding_source_value_id')?.enable({ emitEvent: false });
        this.updateFundingPopup.open = true;
      } else if (event.type === 'closePopUp') {
        this.updateFundingPopup.open = false;
        this.fundingForm.reset();
        // Enable funding source control after reset (for next open)
        this.fundingForm.get('funding_source_value_id')?.enable({ emitEvent: false });
      } else if (event.type === 'saveUpdateFundingStatus') {
        this.updateFundingPopup.open = false;
        this.onFundingClick();
      } else if (event.type === 'exportData') {
        this.exportData();
      } else if (event.type === 'franchiseFilterChange') {
        this.franchiseFilterChange(event.payload);
      }else if (event.type === 'taFilterChange') {
        this.taFilterChange(event.payload || 3);
      } else if (event.type === 'viewIdeaOverlay') {
        this.overlayIdeaUid = event.payload.idea_uid;
        this.overlayStatusLabel = event.payload.statusLabel ?? null;
        this.showViewIdeaOverlay = true;
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
    this.activeTaId = ta_id;
    this.applyActiveFilters();
  }

  franchiseFilterChange(franchise_id: number | null) {
    this.activeFranchiseId = franchise_id;
    this.applyActiveFilters();
  }

  /** Apply current TA + Franchise filters together. */
  private applyActiveFilters(): void {
    let list = [...this.ideas];

    if (this.activeTaId != null) {
      list = list.filter((idea) => idea.ta_id === this.activeTaId);
    }
    if (this.activeFranchiseId != null) {
      list = list.filter((idea) => idea.franchise_id === this.activeFranchiseId);
    }

    this.filteredIdeas = list;
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
    this.selectedIdeaIds = []; // Clear selection on tab change
    this.currentFilterStatusId = status_id;
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
      this.filteredIdeas = this.filteredIdeas.filter((idea) => {
        return this.searchableKeys.some((key) => {
          if (key === 'TAC_or_RP') {
            const tac = idea.target_aspirational_claim ?? '';
            const rp = idea.research_proposal ?? '';
            return (
              String(tac).toLowerCase().includes(search) ||
              String(rp).toLowerCase().includes(search)
            );
          }
          const value = this.getValue(idea, key as string);
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
      let av = this.getValue(a, column);
      let bv = this.getValue(b, column);
      if (column === 'rti_unique_id') {
        av = av != null ? String(av) : '';
        bv = bv != null ? String(bv) : '';
      }

      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });

    this.updatePagedIdeas();
  }

  exportData() {
    const payload: ExportIdeasPayload = {
      id: this.filteredIdeas.map((idea) => idea.idea_id),
    };

    this.ideaService.exportIdeas(payload).subscribe({
      next: (blob: Blob) => {
        try {
          if (!blob || blob.size === 0) {
            throw new Error('Empty response received from server');
          }
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `ideas_export_${new Date().getTime()}.xlsx`;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          }, 100);
          this.ideaEvents.toastEvent('Export completed successfully.');
        } catch (error) {
          console.error('Error in export process:', error);
          this.ideaEvents.toastEvent(
            `Failed to export: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      },
      error: (error: { status?: number; message?: string }) => {
        console.error('API Error exporting data:', error);
        let errorMessage = 'Failed to export data. Please try again.';
        if (error?.status) errorMessage += ` (Status: ${error.status})`;
        if (error?.message) errorMessage += ` - ${error.message}`;
        this.ideaEvents.toastEvent(errorMessage);
      },
    });
  }

  /** Called when Funding button is clicked: call bulk funding API for Funded, Unfunded, or Abandoned status. */
  onFundingClick() {
    if (!this.selectedIdeaIds?.length) {
      this.ideaEvents.toastEvent('Please select at least one idea.');
      return;
    }

    const fundingStatus = this.fundingForm.get('funding_status')?.value;
    const fundingSourceValueId = this.fundingForm.get('funding_source_value_id')?.value;
    const comment = this.fundingForm.get('funding_comment')?.value;
    const updatedBy = this.authService.getCurrentUserId() ?? 1;

    // Validate based on status
    if (fundingStatus === 'Funded' && !fundingSourceValueId) {
      this.ideaEvents.toastEvent('Please select a Funding Source.');
      return;
    }

    if (fundingStatus === 'Abandoned' && !comment) {
      this.ideaEvents.toastEvent('Please provide a reason for abandoning.');
      return;
    }

    // Single selection: call single API
    if (this.selectedIdeaIds.length === 1) {
      const ideaId = this.selectedIdeaIds[0];
      if (fundingStatus === 'Funded') {
        this.ideaService.putFunding(ideaId, { value_id: fundingSourceValueId ?? 0, updated_by: updatedBy }).subscribe({
          next: (res: unknown) => this.handleFundingSuccess(res),
          error: (err) => this.handleFundingError(err),
        });
      } else if (fundingStatus === 'Unfunded') {
        this.ideaService.putNonFunding(ideaId, { value_id: fundingSourceValueId ?? 0, updated_by: updatedBy }).subscribe({
          next: (res: unknown) => this.handleFundingSuccess(res),
          error: (err) => this.handleFundingError(err),
        });
      } else if (fundingStatus === 'Abandoned') {
        this.ideaService.putAbandon(ideaId, { comment: comment || '', updated_by: updatedBy }).subscribe({
          next: (res: unknown) => this.handleFundingSuccess(res),
          error: (err) => this.handleFundingError(err),
        });
      }
    } else {
      // Bulk selection: call bulk API
      const payload = {
        value_id: fundingSourceValueId ?? 0,
        idea_ids: [...this.selectedIdeaIds],
        updated_by: updatedBy,
        comment: comment || ''
      };
      if (fundingStatus === 'Funded') {
        this.ideaService.putFundingBulk(payload).subscribe({
          next: (res: unknown) => this.handleFundingSuccess(res),
          error: (err) => this.handleFundingError(err),
        });
      } else if (fundingStatus === 'Unfunded') {
        this.ideaService.putNonFundingBulk(payload).subscribe({
          next: (res: unknown) => this.handleFundingSuccess(res),
          error: (err) => this.handleFundingError(err),
        });
      } else if (fundingStatus === 'Abandoned') {
        this.ideaService.putAbandonBulk(payload).subscribe({
          next: (res: unknown) => this.handleFundingSuccess(res),
          error: (err) => this.handleFundingError(err),
        });
      }
    }
  }

  /** Handle successful funding status update. */
  private handleFundingSuccess(res: unknown): void {
    // Capture status before clearing/resetting
    const status = this.fundingForm.get('funding_status')?.value;
    let statusId = 0;
    if (status === 'Funded') {
      statusId = 14;
    } else if (status === 'Unfunded') {
      statusId = 15;
    } else if (status === 'Abandoned') {
      statusId = 4;
    }
    this.selectedIdeaIds = [];
    this.fundingForm.reset();
   
    // Set the filter status BEFORE dispatching LoadIdeas so the subscription uses the correct filter
    // The activeStatusId binding in the template will automatically switch the tab
    if (statusId) {
      this.currentFilterStatusId = statusId;
      // Now dispatch LoadIdeas - the subscription will filter by the new statusId
      this.store.dispatch(LoadIdeas());
    } else {
      // No specific status, just reload
      this.store.dispatch(LoadIdeas());
    }
    const msg = (res as { message?: string })?.message ?? 'Ideas updated successfully.';
    this.ideaEvents.toastEvent(msg);
  }

  /** Handle funding status update error. */
  private handleFundingError(err: { error?: { message?: string }; message?: string }): void {
    const msg = err?.error?.message || err?.message || 'Failed to update ideas.';
    this.ideaEvents.toastEvent(msg);
  }

  /** Load funding source options from dropdown values API. */
  loadFundingSourceOptions(): void {
    this.ideaService.getDropdownValues().subscribe({
      next: (values) => {
        // Filter for Funding Source type only
        const fundingSources = values.filter(v => v.type?.type_name === 'Funding Source');
        this.fundingSourceOptions = fundingSources;
        this.fundingSourceSelectOptions = fundingSources.map(v => ({
          id: v.value_id,
          name: v.value_label
        }));
      },
      error: (err) => {
        console.error('Failed to load funding source options:', err);
        this.ideaEvents.toastEvent('Failed to load funding source options.');
      }
    });
  }

  /** Returns true when Funding Source dropdown should be enabled (only when Funded is selected). */
get isFundingSourceEnabled(): boolean {
    return this.fundingForm?.get('funding_status')?.value === 'Funded';
  }

  onEditFromOverlay(idea: Idea): void {
    this.showViewIdeaOverlay = false;
    this.overlayIdeaUid = null;
    this.overlayStatusLabel = null;
    this.router.navigate(['/ideas/', idea.idea_uid, 'edit']);
  }
}
