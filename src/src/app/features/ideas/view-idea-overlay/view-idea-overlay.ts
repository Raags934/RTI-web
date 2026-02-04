import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdeaView } from '../idea-view/idea-view';
import { Idea } from '../../../models/idea.model';
import { Buttons } from '../../../shared/components/buttons/buttons';

@Component({
  selector: 'app-view-idea-overlay',
  standalone: true,
  imports: [CommonModule, IdeaView, Buttons],
  templateUrl: './view-idea-overlay.html',
  styleUrl: './view-idea-overlay.scss',
})
export class ViewIdeaOverlay implements OnChanges {
  @Input() open = false;
  @Input() ideaUid: string | null = null;
  @Input() ideas: Idea[] = [];
  @Input() referrer: string | null = null;
  @Input() statusLabel: string | null = null;

  @Output() closeOverlay = new EventEmitter<void>();
  @Output() editDetails = new EventEmitter<Idea>();

  /** Current idea UID shown in overlay (for Prev/Next within overlay). */
  currentIdeaUid: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue === true) {
      this.currentIdeaUid = this.ideaUid;
    }
    if (changes['ideaUid'] && this.open) {
      this.currentIdeaUid = this.ideaUid;
    }
  }

  onBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('overlay-backdrop')) {
      this.close();
    }
  }

  close(): void {
    this.closeOverlay.emit();
  }

  onEdit(idea: Idea): void {
    this.editDetails.emit(idea);
  }

  goPrev(): void {
    if (!this.currentIdeaUid || !this.ideas.length) return;
    const idx = this.ideas.findIndex((i) => i.idea_uid === this.currentIdeaUid);
    if (idx > 0) this.currentIdeaUid = this.ideas[idx - 1].idea_uid;
  }

  goNext(): void {
    if (!this.currentIdeaUid || !this.ideas.length) return;
    const idx = this.ideas.findIndex((i) => i.idea_uid === this.currentIdeaUid);
    if (idx >= 0 && idx < this.ideas.length - 1) this.currentIdeaUid = this.ideas[idx + 1].idea_uid;
  }
}
