import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { User } from '../../../../models/user.model';
import {
  FunctionItem,
  TherapeuticAreaItem,
} from '../manage-user.service';

export interface EditUserPayload {
  user_id: number | null;
  name: string;
  email: string;
  active: boolean;
  roleIds: number[];
  functionIds: number[];
  taIds: number[];
}

@Component({
  selector: 'app-edit-user-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './edit-user-detail.html',
  styleUrl: './edit-user-detail.scss',
})
export class EditUserDetail implements OnChanges {
  @Input() user: User | null = null;
  @Input() visible = false;
  @Input() functions: FunctionItem[] = [];
  @Input() therapeuticAreas: TherapeuticAreaItem[] = [];
  @Input() staticRoles: { id: number; name: string }[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter<EditUserPayload>();

  editUserName = '';
  editUserEmail = '';
  editUserActive = true;
  selectedRoleIds: number[] = [];
  selectedFunctionIds: number[] = [];
  selectedTaIds: number[] = [];
  pendingRoleIds: number[] = [];
  pendingFunctionIds: number[] = [];
  pendingTaIds: number[] = [];
  roleDropdownOpen = false;
  functionDropdownOpen = false;
  taDropdownOpen = false;
  roleSearch = '';
  functionSearch = '';
  taSearch = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.editUserName = this.user.name ?? '';
      this.editUserEmail = this.user.email ?? '';
      this.editUserActive = this.user.active ?? true;
      this.selectedRoleIds = (this.user.roles ?? []).map((r) => r.role_id);
      this.selectedFunctionIds = (this.user.functions ?? []).map((f) => f.function_id);
      this.selectedTaIds = (this.user.therapeutic_areas ?? []).map((ta) => ta.ta_id);
      this.pendingRoleIds = [];
      this.pendingFunctionIds = [];
      this.pendingTaIds = [];
      this.roleDropdownOpen = false;
      this.functionDropdownOpen = false;
      this.taDropdownOpen = false;
      this.roleSearch = '';
      this.functionSearch = '';
      this.taSearch = '';
    }
  }

  onClose(): void {
    this.close.emit();
  }

  openRoleDropdown(): void {
    this.pendingRoleIds = [...this.selectedRoleIds];
    this.roleDropdownOpen = true;
    this.functionDropdownOpen = false;
    this.taDropdownOpen = false;
  }
  openFunctionDropdown(): void {
    this.pendingFunctionIds = [...this.selectedFunctionIds];
    this.functionDropdownOpen = true;
    this.roleDropdownOpen = false;
    this.taDropdownOpen = false;
  }
  openTaDropdown(): void {
    this.pendingTaIds = [...this.selectedTaIds];
    this.taDropdownOpen = true;
    this.roleDropdownOpen = false;
    this.functionDropdownOpen = false;
  }

  togglePendingRole(id: number): void {
    if (this.pendingRoleIds.includes(id)) {
      this.pendingRoleIds = this.pendingRoleIds.filter((r) => r !== id);
    } else {
      this.pendingRoleIds = [...this.pendingRoleIds, id];
    }
  }
  togglePendingFunction(id: number): void {
    if (this.pendingFunctionIds.includes(id)) {
      this.pendingFunctionIds = this.pendingFunctionIds.filter((f) => f !== id);
    } else {
      this.pendingFunctionIds = [...this.pendingFunctionIds, id];
    }
  }
  togglePendingTa(id: number): void {
    if (this.pendingTaIds.includes(id)) {
      this.pendingTaIds = this.pendingTaIds.filter((t) => t !== id);
    } else {
      this.pendingTaIds = [...this.pendingTaIds, id];
    }
  }

  assignRoles(): void {
    this.selectedRoleIds = [...this.pendingRoleIds];
    this.roleDropdownOpen = false;
  }
  assignFunctions(): void {
    this.selectedFunctionIds = [...this.pendingFunctionIds];
    this.functionDropdownOpen = false;
  }
  assignTherapeuticAreas(): void {
    this.selectedTaIds = [...this.pendingTaIds];
    this.taDropdownOpen = false;
  }

  removeRole(id: number): void {
    this.selectedRoleIds = this.selectedRoleIds.filter((r) => r !== id);
  }
  removeFunction(id: number): void {
    this.selectedFunctionIds = this.selectedFunctionIds.filter((f) => f !== id);
  }
  removeTa(id: number): void {
    this.selectedTaIds = this.selectedTaIds.filter((t) => t !== id);
  }

  isPendingRole(id: number): boolean {
    return this.pendingRoleIds.includes(id);
  }
  isPendingFunction(id: number): boolean {
    return this.pendingFunctionIds.includes(id);
  }
  isPendingTa(id: number): boolean {
    return this.pendingTaIds.includes(id);
  }

  getSelectedRoles(): { id: number; name: string }[] {
    return this.selectedRoleIds
      .map((id) => this.staticRoles.find((r) => r.id === id))
      .filter((r): r is { id: number; name: string } => !!r);
  }
  getSelectedFunctions(): FunctionItem[] {
    return this.selectedFunctionIds
      .map((id) => this.functions.find((f) => f.function_id === id))
      .filter((f): f is FunctionItem => !!f);
  }
  getSelectedTherapeuticAreas(): TherapeuticAreaItem[] {
    return this.selectedTaIds
      .map((id) => this.therapeuticAreas.find((t) => t.ta_id === id))
      .filter((t): t is TherapeuticAreaItem => !!t);
  }

  get filteredStaticRoles(): { id: number; name: string }[] {
    const q = this.roleSearch.toLowerCase().trim();
    return q
      ? this.staticRoles.filter((r) => r.name.toLowerCase().includes(q))
      : this.staticRoles;
  }
  get filteredFunctions(): FunctionItem[] {
    const q = this.functionSearch.toLowerCase().trim();
    return q
      ? this.functions.filter((f) =>
          (f.function_name ?? '').toLowerCase().includes(q)
        )
      : this.functions;
  }
  get filteredTherapeuticAreas(): TherapeuticAreaItem[] {
    const q = this.taSearch.toLowerCase().trim();
    return q
      ? this.therapeuticAreas.filter((ta) =>
          (ta.ta_name ?? '').toLowerCase().includes(q)
        )
      : this.therapeuticAreas;
  }

  onUpdate(): void {
    this.update.emit({
      user_id: this.user?.user_id ?? null,
      name: this.editUserName,
      email: this.editUserEmail,
      active: this.editUserActive,
      roleIds: this.selectedRoleIds,
      functionIds: this.selectedFunctionIds,
      taIds: this.selectedTaIds,
    });
  }
}
