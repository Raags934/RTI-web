import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdeaEventsService } from '../../../events/ideaServiceEvents';
import { IdeaService } from '../../../store/idea.service';
import { AuditLog } from '../../../models/audit-log.model';
import { Subscription } from 'rxjs';

interface HistoryItem {
  user: string;
  comment: string;
  date: string;
}

@Component({
  selector: 'app-idea-history',
  imports: [CommonModule],
  templateUrl: './idea-history.html',
  styleUrl: './idea-history.scss',
})

export class IdeaHistory implements OnInit, OnChanges, OnDestroy {
  private _open: boolean = false;
  private _ideaId: number = 0;

  @Input() 
  set open(value: boolean) {
    const wasOpen = this._open;
    this._open = value;
    // If opening and we have a valid ideaId, load history
    if (value && !wasOpen && this._ideaId > 0) {
      console.log('🔓 Popup opened via setter, loading history for ideaId:', this._ideaId);
      // Use setTimeout to ensure change detection has completed
      setTimeout(() => this.loadHistory(), 0);
    } else if (!value && wasOpen) {
      // Closing - reset data
      this.resetData();
    }
  }
  get open(): boolean {
    return this._open;
  }

  @Input() 
  set ideaId(value: number) {
    const previousId = this._ideaId;
    this._ideaId = value;
    // If ideaId changed and popup is open, load new history
    if (value > 0 && value !== previousId && this._open) {
      console.log('🔄 ideaId changed via setter, loading history for ideaId:', value);
      setTimeout(() => this.loadHistory(), 0);
    }
  }
  get ideaId(): number {
    return this._ideaId;
  }

  @Input() ideaUid: string = '';

  historyList: HistoryItem[] = [];
  loading: boolean = false;
  private lastLoadedIdeaId: number = 0;
  private apiSubscription?: Subscription;

  constructor(
    private ideaEvents: IdeaEventsService,
    private ideaService: IdeaService
  ) {}

  ngOnInit() {
    if (this.open && this.ideaId > 0) {
      console.log('🚀 ngOnInit - popup already open, loading history');
      this.loadHistory();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('🔄 ngOnChanges triggered:', {
      open: this.open,
      ideaId: this.ideaId,
      changes: Object.keys(changes)
    });
    // The setters handle the logic, but we keep this for additional logging
  }

  private resetData() {
    console.log('🔒 Resetting data');
    this.historyList = [];
    this.lastLoadedIdeaId = 0;
    this.loading = false;
    // Cancel any ongoing API call
    if (this.apiSubscription) {
      this.apiSubscription.unsubscribe();
      this.apiSubscription = undefined;
    }
  }

  loadHistory() {
    if (!this.ideaId || this.ideaId === 0) {
      console.warn('⚠️ Cannot load history: ideaId is not set or is 0', { 
        ideaId: this.ideaId, 
        open: this.open 
      });
      return;
    }

    // Don't reload if we already loaded this idea's history (unless it's empty)
    if (this.lastLoadedIdeaId === this.ideaId && this.historyList.length > 0) {
      console.log('ℹ️ History already loaded for idea_id:', this.ideaId);
      return;
    }

    console.log('🔄 Loading idea history for idea_id:', this.ideaId);
    this.loading = true;
    this.historyList = []; // Clear previous data
    this.lastLoadedIdeaId = this.ideaId;
    
    // Cancel any previous subscription
    if (this.apiSubscription) {
      this.apiSubscription.unsubscribe();
    }
    
    this.apiSubscription = this.ideaService.getAuditLogs(this.ideaId).subscribe({
      next: (auditLogs: AuditLog[]) => {
        console.log('✅ Received audit logs:', auditLogs);
        this.historyList = auditLogs.map((log) => ({
          user: log.changed_by?.name || 'Unknown User',
          comment: log.change_description || '',
          date: this.formatDate(log.changed_at)
        }));
        this.loading = false;
        this.apiSubscription = undefined;
      },
      error: (error) => {
        console.error('❌ Error loading idea history:', error);
        console.error('Error details:', {
          status: error.status,
          message: error.message,
          url: error.url,
          error: error.error
        });
        this.historyList = [];
        this.loading = false;
        this.lastLoadedIdeaId = 0; // Reset so we can retry
        this.apiSubscription = undefined;
        // Show error message to user
        const errorMsg = error.error?.message || error.message || 'Unknown error';
        alert(`Failed to load idea history: ${errorMsg}. Please check the console for details.`);
      }
    });
  }

  ngOnDestroy() {
    if (this.apiSubscription) {
      this.apiSubscription.unsubscribe();
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day} ${month}, ${year} | ${hours}:${minutes}`;
    } catch (error) {
      return dateString;
    }
  }

  closeHistory() {
    this.ideaEvents.closeIdeaHistory();
  }

  onBackdrop(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('overlay-backdrop')) {
      this.closeHistory();
    }
  }
}
