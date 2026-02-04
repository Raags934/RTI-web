import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Buttons } from '../buttons/buttons';
import { CommonModule } from '@angular/common';
import { IdeaEvent, IdeaEventsService } from '../../../events/ideaServiceEvents';

@Component({
  selector: 'app-popup',
  imports: [Buttons, CommonModule],
  templateUrl: './popup.html',
  styleUrl: './popup.scss',
})
export class PopUp {
  @Input() open = false;
  @Input() title = '';
  @Input() helper = '';
  @Input() cancelText = 'Cancel';
  @Input() confirmText = 'Confirm';
  @Input() size : 'small' | 'medium' | 'large' = 'medium';
  @Input() confirmPopupAction: IdeaEvent['type'] = "closePopUp";
  @Input() showCancelButton: boolean = true;

  constructor(private ideaEvent: IdeaEventsService) {}

  onBackdrop(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('cd-backdrop')) {
      this.ideaEvent.closePopUp()
    }
  }
}
