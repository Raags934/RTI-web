import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { User } from '../../../models/user.model';
import { AppState } from '../../../app.state';
import { Idea } from '../../../models/idea.model';
import {
  ManageUserService,
  FunctionItem,
  TherapeuticAreaItem,
  FunctionsMembersPayload,
} from './manage-user.service';
import { IdeaEventsService } from '../../../events/ideaServiceEvents';
import { Buttons } from '../../../shared/components/buttons/buttons';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { ViewUserDetail } from './view-user-detail/view-user-detail';
import { EditUserDetail, EditUserPayload } from './edit-user-detail/edit-user-detail';
import { IdeaHistory } from '../../ideas/idea-history/idea-history';

@Component({
  selector: 'app-manage-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatIconModule,
    Buttons,
    Pagination,
    ViewUserDetail,
    EditUserDetail,
    IdeaHistory,
  ],
  templateUrl: './manage-user.html',
  styleUrl: './manage-user.scss',
})
export class ManageUser implements OnInit, OnDestroy {
  users: User[] = [];
  filteredUsers: User[] = [];
  pagedUsers: User[] = [];
  searchValue = '';
  currentPage = 1;
  pageSize = 6;
  totalPages = 1;
  displayedColumns: string[] = [
    'name',
    'email',
    'function',
    'roles',
    'therapeutic_area',
    'status',
    'options',
  ];
  /** Column config for headers; sortable columns show arrow filter icons (Roles has no arrow per screenshot). */
  userColumns: { key: string; label: string; sortable: boolean }[] = [
    { key: 'name', label: 'User Name', sortable: true },
    { key: 'email', label: 'Email ID', sortable: true },
    { key: 'function', label: 'Function', sortable: true },
    { key: 'roles', label: 'Roles', sortable: false },
    { key: 'therapeutic_area', label: 'Therapeutic Area (Franchise)', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'options', label: '', sortable: false },
  ];
  openOptionsMenuId: number | null = null;

  /** Add User overlay */
  showAddUserOverlay = false;
  addUserName = '';
  addUserEmail = '';
  
  /** View User Details (separate component) */
  showViewUserOverlay = false;
  viewUser: User | null = null;

  /** Edit User Details (separate component) */
  showEditUserOverlay = false;
  editUser: User | null = null;

  /** Idea History (same as admin/home More Options) */
  showIdeaHistory = false;
  selectedIdeaId = 0;
  selectedIdeaUid = '';

  /** Static roles for Role dropdown (per screenshot). */
  staticRoles: { id: number; name: string }[] = [
    { id: 1, name: 'Creator' },
    { id: 2, name: 'Confirmer' },
    { id: 3, name: 'Assessor' },
    { id: 4, name: 'Harmonizer' },
    { id: 5, name: 'Data Checker' },
  ];
  functions: FunctionItem[] = [];
  therapeuticAreas: TherapeuticAreaItem[] = [];
  selectedRoleIds: number[] = [];
  selectedFunctionIds: number[] = [];
  selectedTaIds: number[] = [];
  /** Pending selections while dropdown is open (for Assign button). */
  pendingRoleIds: number[] = [];
  pendingFunctionIds: number[] = [];
  pendingTaIds: number[] = [];
  roleDropdownOpen = false;
  functionDropdownOpen = false;
  taDropdownOpen = false;
  roleSearch = '';
  functionSearch = '';
  taSearch = '';

  private currentSortColumn: string | null = null;
  private currentDirection: 'asc' | 'desc' | null = null;
  private sub?: Subscription;

  constructor(
    private manageUserService: ManageUserService,
    private ideaEvents: IdeaEventsService,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.manageUserService.getUsers().subscribe({
      next: (users) => {
        this.users = users ?? [];
        this.applySearch();
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.users = [];
        this.applySearch();
      },
    });

    this.sub = this.ideaEvents.events$.subscribe((event) => {
      if (event.type === 'changePage') {
        this.changePage(event.payload);
      } else if (event.type === 'closeIdeaHistory') {
        this.showIdeaHistory = false;
        this.selectedIdeaId = 0;
        this.selectedIdeaUid = '';
      }
    });
  }

  /** Open Idea History overlay for an idea created by this user (same behavior as admin/home). */
  onViewIdeaHistory(user: User): void {
    const userId = user.user_id ?? null;
    if (userId === null) return;
    this.closeOptionsMenu();
    this.store
      .select((state) => state.ideas)
      .pipe(take(1))
      .subscribe((ideas: Idea[] | undefined) => {
        const list = ideas ?? [];
        const userIdeas = list.filter(
          (i) => (i.created_by?.user_id ?? null) === userId
        );
        const idea = userIdeas.length > 0
          ? [...userIdeas].sort(
              (a, b) =>
                new Date(b.updated_at).getTime() -
                new Date(a.updated_at).getTime()
            )[0]
          : null;
        if (idea) {
          this.selectedIdeaId = idea.idea_id;
          this.selectedIdeaUid = idea.idea_uid ?? '';
          this.showIdeaHistory = true;
        } else {
          alert('No ideas found for this user.');
        }
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onSearch(): void {
    this.applySearch();
  }

  onResetSearch(): void {
    this.searchValue = '';
    this.applySearch();
  }

  private applySearch(): void {
    const search = this.searchValue.toLowerCase().trim();
    if (!search) {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(
        (u) =>
          (u.name ?? '').toLowerCase().includes(search) ||
          (u.email ?? '').toLowerCase().includes(search) ||
          (u.functions ?? []).some((f) =>
            (f.function_name ?? '').toLowerCase().includes(search)
          ) ||
          (u.roles ?? []).some((r) =>
            (r.role_name ?? '').toLowerCase().includes(search)
          ) ||
          (u.therapeutic_areas ?? []).some((ta) =>
            (ta.ta_name ?? '').toLowerCase().includes(search)
          )
      );
    }
    this.totalPages = Math.max(
      1,
      Math.ceil(this.filteredUsers.length / this.pageSize)
    );
    this.currentPage = 1;
    this.applySort();
    this.updatePagedUsers();
  }

  private updatePagedUsers(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedUsers = this.filteredUsers.slice(start, start + this.pageSize);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagedUsers();
    }
  }

  onSort(columnKey: string): void {
    const col = this.userColumns.find((c) => c.key === columnKey);
    if (!col?.sortable) return;
    if (this.currentSortColumn === columnKey) {
      this.currentDirection = this.currentDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortColumn = columnKey;
      this.currentDirection = 'asc';
    }
    this.applySort();
    this.updatePagedUsers();
  }

  getDirection(columnKey: string): 'asc' | 'desc' | null {
    return this.currentSortColumn === columnKey ? this.currentDirection : null;
  }

  private applySort(): void {
    if (!this.currentSortColumn || !this.currentDirection) return;
    const dir = this.currentDirection === 'asc' ? 1 : -1;
    this.filteredUsers = [...this.filteredUsers].sort((a, b) => {
      const av = this.getSortValue(a, this.currentSortColumn!);
      const bv = this.getSortValue(b, this.currentSortColumn!);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }

  private getSortValue(user: User, columnKey: string): string | number | boolean {
    switch (columnKey) {
      case 'name':
        return (user.name ?? '').toString();
      case 'email':
        return (user.email ?? '').toString();
      case 'function':
        return this.getFunctionsDisplay(user);
      case 'therapeutic_area':
        return this.getTherapeuticAreaDisplay(user);
      case 'status':
        return this.getStatusDisplay(user);
      default:
        return '';
    }
  }

  getFunctionsDisplay(user: User): string {
    const list = user.functions ?? [];
    return list.map((f) => f.function_name).filter(Boolean).join(', ') || '—';
  }

  getRolesDisplay(user: User): string {
    const list = user.roles ?? [];
    return list.map((r) => r.role_name).filter(Boolean).join(' & ') || '—';
  }

  getTherapeuticAreaDisplay(user: User): string {
    const list = user.therapeutic_areas ?? [];
    return list.map((ta) => ta.ta_name).filter(Boolean).join(', ') || '—';
  }

  getStatusDisplay(user: User): string {
    return user.active ? 'Active' : 'Inactive';
  }

  getStatusColor(user: User): string {
    return user.active ? 'var(--success-400)' : 'var(--alert-300)';
  }

  toggleOptionsMenu(userId: number): void {
    this.openOptionsMenuId =
      this.openOptionsMenuId === userId ? null : userId;
  }

  isOptionsMenuOpen(userId: number): boolean {
    return this.openOptionsMenuId === userId;
  }

  closeOptionsMenu(): void {
    this.openOptionsMenuId = null;
  }

  onExportData(): void {
    // TODO: wire to export users API when available
  }

  onAddUser(): void {
    this.showAddUserOverlay = true;
    this.addUserName = '';
    this.addUserEmail = '';
    this.selectedRoleIds = [];
    this.selectedFunctionIds = [];
    this.selectedTaIds = [];
    this.pendingRoleIds = [];
    this.pendingFunctionIds = [];
    this.pendingTaIds = [];
    this.roleDropdownOpen = false;
    this.functionDropdownOpen = false;
    this.taDropdownOpen = false;
    this.roleSearch = '';
    this.functionSearch = '';
    this.taSearch = '';
    this.loadAddUserDropdowns();
  }

  closeAddUserOverlay(): void {
    this.showAddUserOverlay = false;
  }

  private loadAddUserDropdowns(): void {
    this.manageUserService.getFunctions().subscribe({
      next: (list) => (this.functions = list ?? []),
      error: () => (this.functions = []),
    });
    this.manageUserService.getTherapeuticAreas().subscribe({
      next: (list) => (this.therapeuticAreas = list ?? []),
      error: () => (this.therapeuticAreas = []),
    });
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

  /** Current user id for assigned_by (e.g. from auth; fallback 1 for now). */
  private getAssignedBy(): number {
    return 1;
  }

  onSubmitAddUser(): void {
    const name = (this.addUserName ?? '').trim();
    const email = (this.addUserEmail ?? '').trim();
    if (!name || !email) {
      alert('User Name and Email ID are required.');
      return;
    }
    const payload: FunctionsMembersPayload = {
      username: name,
      emailid: email,
      assigned_by: this.getAssignedBy(),
      assign: {
        function_ids: [...this.selectedFunctionIds],
        role_ids: [...this.selectedRoleIds],
        ta_ids: [...this.selectedTaIds],
      },
      unassign: {
        function_ids: [],
        role_ids: [],
        ta_ids: [],
      },
    };
    this.manageUserService.updateMembers(payload).subscribe({
      next: () => {
        this.refreshUsers();
        this.closeAddUserOverlay();
      },
      error: (err) => {
        console.error('Add user failed', err);
        alert(err?.error?.message ?? 'Failed to add user. Please try again.');
      },
    });
  }

  /** View User Details overlay */
  onViewUserDetails(user: User): void {
    this.viewUser = user;
    this.showViewUserOverlay = true;
    this.closeOptionsMenu();
  }

  closeViewUserOverlay(): void {
    this.showViewUserOverlay = false;
    this.viewUser = null;
  }

  openEditFromView(): void {
    if (!this.viewUser) return;
    this.editUser = this.viewUser;
    this.showViewUserOverlay = false;
    this.showEditUserOverlay = true;
    this.loadAddUserDropdowns();
  }

  closeEditUserOverlay(): void {
    this.showEditUserOverlay = false;
    this.editUser = null;
  }

  private refreshUsers(): void {
    this.manageUserService.getUsers().subscribe({
      next: (users) => {
        this.users = users ?? [];
        this.applySearch();
      },
      error: (err) => {
        console.error('Failed to refresh users', err);
      },
    });
  }

  onUpdateUser(payload: EditUserPayload): void {
    const userId = payload.user_id ?? this.editUser?.user_id ?? null;
    if (userId == null) {
      alert('User ID is required to update.');
      return;
    }
    const originalRoleIds = (this.editUser?.roles ?? []).map((r) => r.role_id);
    const originalFunctionIds = (this.editUser?.functions ?? []).map((f) => f.function_id);
    const originalTaIds = (this.editUser?.therapeutic_areas ?? []).map((ta) => ta.ta_id);
    const assignRoleIds = payload.roleIds.filter((id) => !originalRoleIds.includes(id));
    const unassignRoleIds = originalRoleIds.filter((id) => !payload.roleIds.includes(id));
    const assignFunctionIds = payload.functionIds.filter((id) => !originalFunctionIds.includes(id));
    const unassignFunctionIds = originalFunctionIds.filter((id) => !payload.functionIds.includes(id));
    const assignTaIds = payload.taIds.filter((id) => !originalTaIds.includes(id));
    const unassignTaIds = originalTaIds.filter((id) => !payload.taIds.includes(id));
    const apiPayload: FunctionsMembersPayload = {
      user_id: userId,
      active: payload.active,
      assigned_by: this.getAssignedBy(),
      assign: {
        function_ids: assignFunctionIds,
        role_ids: assignRoleIds,
        ta_ids: assignTaIds,
      },
      unassign: {
        function_ids: unassignFunctionIds,
        role_ids: unassignRoleIds,
        ta_ids: unassignTaIds,
      },
    };
    this.manageUserService.updateMembers(apiPayload).subscribe({
      next: () => {
        this.refreshUsers();
        this.closeEditUserOverlay();
      },
      error: (err) => {
        console.error('Update user failed', err);
        alert(err?.error?.message ?? 'Failed to update user. Please try again.');
      },
    });
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeOptionsMenu();
  }
}
