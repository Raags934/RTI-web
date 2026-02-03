import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { User } from '../../../../models/user.model';
import { Buttons } from '../../../../shared/components/buttons/buttons';

@Component({
  selector: 'app-view-user-detail',
  standalone: true,
  imports: [CommonModule, MatIconModule, Buttons],
  templateUrl: './view-user-detail.html',
  styleUrl: './view-user-detail.scss',
})
export class ViewUserDetail {
  @Input() user: User | null = null;
  @Input() visible = false;

  @Output() close = new EventEmitter<void>();
  @Output() editUser = new EventEmitter<void>();

  getStatusDisplay(user: User): string {
    return user.active ? 'Active' : 'Inactive';
  }

  getStatusColor(user: User): string {
    return user.active ? 'var(--success-400)' : 'var(--alert-300)';
  }

  onClose(): void {
    this.close.emit();
  }

  onEditUser(): void {
    this.editUser.emit();
  }
}
