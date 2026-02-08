import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, HostListener, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RankingDropdownService } from './ranking-dropdown.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ranking-dropdown',
  imports: [CommonModule, MatIconModule],
  templateUrl: './ranking-dropdown.html',
  styleUrl: './ranking-dropdown.scss',
})
export class RankingDropdown implements OnInit, OnDestroy {
  @Input() value: number | null = null;
  @Input() disabled: boolean = false;
  @Output() valueChange = new EventEmitter<number | null>();

  @ViewChild('container', { static: false }) containerRef!: ElementRef;
  @ViewChild('rankingValue', { static: false }) rankingValueRef!: ElementRef;
  @ViewChild('dropdownMenu', { static: false }) dropdownMenuRef!: ElementRef;

  isOpen = false;
  ranks = Array.from({ length: 10 }, (_, i) => i + 1);
  dropdownPosition = { top: '0px', left: '0px' };
  private dropdownId: string;
  private subscription?: Subscription;

  constructor(private dropdownService: RankingDropdownService) {
    // Generate unique ID for this dropdown instance
    this.dropdownId = `dropdown-${Math.random().toString(36).substring(2, 11)}`;
  }

  ngOnInit() {
    // Subscribe to service to know when other dropdowns open/close
    this.subscription = this.dropdownService.openDropdownId$.subscribe(openId => {
      this.isOpen = openId === this.dropdownId;
      if (this.isOpen) {
        setTimeout(() => {
          this.updateDropdownPosition();
        }, 0);
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    // Close this dropdown if it's currently open
    if (this.isOpen) {
      this.dropdownService.closeAll();
    }
    this.value = null;
  }

  get displayValue(): string {
    if (this.value === null || this.value === undefined) {
      return '';
    }
    return this.value.toString().padStart(2, '0');
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    event.preventDefault();

    // Don't open if disabled
    if (this.disabled) {
      return;
    }

    if (this.isOpen) {
      // Close this dropdown
      this.dropdownService.closeAll();
    } else {
      // Open this dropdown (service will close others)
      this.dropdownService.openDropdown(this.dropdownId);
    }
  }

  updateDropdownPosition() {
    // Position dropdown at a fixed location on screen
    // This ensures consistent positioning regardless of which row triggers it

    // Get the dropdown menu width and height
    let dropdownWidth = 150; // min-width from SCSS
    let dropdownHeight = 200; // approximate height (header + options)

    if (this.dropdownMenuRef?.nativeElement) {
      const menuRect = this.dropdownMenuRef.nativeElement.getBoundingClientRect();
      dropdownWidth = menuRect.width || 150;
      dropdownHeight = menuRect.height || 200;
    }

    // Calculate fixed position
    const viewportHeight = window.innerHeight;

    // Fixed left position at 1129px, vertically centered
    const leftPosition = 1129;
    const topPosition = (viewportHeight - dropdownHeight) / 2;

    this.dropdownPosition = {
      top: `${topPosition}px`,
      left: `${leftPosition}px`
    };
  }

  selectRank(rank: number, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.value = rank;
    this.valueChange.emit(rank);
    this.dropdownService.closeAll();
  }

  closeDropdown(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.dropdownService.closeAll();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.isOpen) return;

    const target = event.target as HTMLElement;
    const container = this.containerRef?.nativeElement;
    const menu = this.dropdownMenuRef?.nativeElement;

    // Check if click is outside both container and menu
    if (container && !container.contains(target)) {
      if (!menu || !menu.contains(target)) {
        this.dropdownService.closeAll();
      }
    }
  }
}
