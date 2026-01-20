import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IdeaEvent, IdeaEventsService } from '../../../events/ideaServiceEvents';

@Component({
  selector: 'app-buttons',
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './buttons.html',
  styleUrl: './buttons.scss',
})
export class Buttons {
  @Input() variant: 'type1' | 'type2' = 'type1';
  @Input() color: string = 'primary';
  @Input() size: 'xsmall' | 'small' | 'medium' | 'large' = 'medium';
  @Input() icon?: string;
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() isDisabled: boolean = false;

  // Only allow event types that this button can actually trigger
  @Input() actionType: IdeaEvent['type'] = 'closePopUp';

  @Input() isStatus = false;

  constructor(private ideaEvents: IdeaEventsService) {}

  onClick() {
    switch (this.actionType) {
      case 'submitIdea':
        this.ideaEvents.submitIdea();
        break;

      case 'saveDraft':
        this.ideaEvents.saveDraft();
        break;

      case 'cancelIdea':
        this.ideaEvents.cancelIdea();
        break;

      case 'closePopUp':
        this.ideaEvents.closePopUp();
        break;

      case 'confirmPopUp':
        this.ideaEvents.confirmPopUp();
        break;

      case 'nextIdea':
        this.ideaEvents.nextIdea();
        break;

      case 'prevIdea':
        this.ideaEvents.prevIdea();
        break;

      default:
        console.warn('Unhandled actionType:', this.actionType);
        break;
    }
  }
}
