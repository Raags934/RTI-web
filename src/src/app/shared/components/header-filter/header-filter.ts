import { Component,Input, Output, EventEmitter, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormInput } from '../form-input/form-input';
import { MatCardModule } from '@angular/material/card';
import { AppState } from '../../../app.state';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { User } from '../../../models/user.model';
import { Franchise } from '../../../models/productsList.model';
import { DropdownOption } from '../../../models/DropDownOption';
import { NavigationEnd, Router } from '@angular/router';

import {
  mapFranchisesToDropdown,
  mapTAsToDropdown,
  mapRolesToDropdown,
  mapFunctionsToDropdown,
} from '../../functions/dropdownMapping';
import { IdeaEventsService } from '../../../events/ideaServiceEvents';

@Component({
  selector: 'app-header-filter',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    FormsModule,
    ReactiveFormsModule,
    FormInput,
    MatCardModule,
  ],
  templateUrl: './header-filter.html',
  styleUrl: './header-filter.scss',
})
export class HeaderFilter implements OnInit {
  @Input() isAdmin: boolean = false;
  /** When true, dropdowns start with no selection (All); when false, first option is auto-selected. */
  @Input() useAllByDefault: boolean = false;
  filterForm = new FormGroup({
    franchise: new FormControl<string | null>(null),
    ta: new FormControl<string | null>(null),
    role: new FormControl<string | null>(null),
    function: new FormControl<string | null>(null),
  });

  user$: Observable<User | undefined>;
  franchises$: Observable<Franchise[] | undefined>;

  franchiseOptions: DropdownOption[] = [];
  taOptions: DropdownOption[] = [];
  taFilteredOptions: DropdownOption[] = [];
  roleOptions: DropdownOption[] = [];
  functionsOptions: DropdownOption[] = [];
  groupsOptions: DropdownOption[] = [];

  private sub= Subscription;

  /** Cached current user for filter auto-initialisation logic. */
  private currentUser: User | null = null;
  /** Guard to ensure we only auto-initialise filters once per component lifecycle. */
  private initializedFromUser: boolean = false;

  constructor(
    private store: Store<AppState>,
    private eventService: IdeaEventsService,
    private router: Router
  ) {
    this.user$ = this.store.select((state) => state.masterData?.data?.user);
    this.franchises$ = this.store.select((state) => state.masterData?.data?.franchises);

    // Emit on ANY filter change
    this.filterForm.valueChanges.subscribe((value) => {
      //this.filterChange.emit(value);
    });
  }
  ngOnInit(): void {
    this.user$.subscribe((user) => {
      this.currentUser = user ?? null;
      if (!user) return;

      this.roleOptions = mapRolesToDropdown(user);
      this.functionsOptions = mapFunctionsToDropdown(user);
      this.groupsOptions = mapFunctionsToDropdown(user);

      // Once roles are loaded, sync selected role with current route.
      this.syncRoleWithCurrentRoute(this.router.url);

      // After user is loaded and role is synced, attempt to auto-populate
      // TA, Franchise, and Function filters from the user's assignments.
      this.tryInitializeFiltersFromUser();
    });

    this.franchises$.subscribe((list) => {
      if (!list) return;

      this.franchiseOptions = mapFranchisesToDropdown(list);
      this.taOptions = mapTAsToDropdown(list);

      // Once franchise / TA dropdown options are ready, attempt to
      // auto-populate filters from user assignments (if not already done).
      this.tryInitializeFiltersFromUser();
    });

    // this.sub = this.eventService.events$.subscribe((event) => {
    //   if (event.type === 'franchiseFilterChange') {
    //     this.applyFilter(event.payload);
    //   }

    // 🔥 TA-specific change listener
    this.filterForm.get('ta')?.valueChanges.subscribe((taId) => {
      const value = taId ? Number(taId) : null;
      this.eventService.taFilterChange(value);
    });

    // 🔥 Franchise-specific change listener
    this.filterForm.get('franchise')?.valueChanges.subscribe((franchiseId) => {
      const value = franchiseId ? Number(franchiseId) : null;
      this.eventService.franchiseFilterChange(value);
    });

    // 🔥 Role-specific change listener
    this.filterForm.get('role')?.valueChanges.subscribe((roleId) => {
      const value = roleId ? Number(roleId) : null;
      this.eventService.roleFilterChange(value);

      const targetRoute = this.getRouteForRoleId(value);
      if (targetRoute) {
        const currentPath = (this.router.url || '').split('?')[0];
        // Only force a full reload when actually changing to a different role route.
        if (currentPath !== targetRoute) {
          this.router.navigateByUrl(targetRoute).then(() => {
            // Full page reload so that the new role dashboard boots
            // with its default filters/status tabs applied.
            window.location.reload();
          });
        }
      }
    });

    // 🔥 Function-specific change listener
    this.filterForm.get('function')?.valueChanges.subscribe((functionId) => {
      const value = functionId ? Number(functionId) : null;
      this.eventService.functionFilterChange(value);
    });

    // Keep role dropdown in sync when navigating via sidebar / URL.
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.syncRoleWithCurrentRoute(event.urlAfterRedirects || event.url);
      }
    });
  }

  // // Optional helper if needed
  // filterFranchisesByTA(taId: string | number) {
  //   this.franchiseOptions = this.franchiseOptions.filter(f =>
  //     (f as any).ta_ids?.includes(taId)
  //   );
  // }

  /** Map a selected role to its corresponding landing route. */
  private getRouteForRoleId(roleId: number | null): string | null {
    if (roleId == null) return null;

    const role = this.roleOptions.find((r) => r.id === roleId);
    if (!role) return null;

    const name = this.normalizeRoleName(role.name);

    if (this.isAdminLike(name)) return '/admin';
    if (this.isCreatorLike(name)) return '/';
    if (this.isHarmonizerLike(name)) return '/harmonizer';
    if (this.isProductPrioritizerLike(name)) return '/productprioritization';
    if (this.isTaPrioritizerLike(name)) return '/taprioritization';
    if (this.isFunderLike(name)) return '/funding';

    return null;
  }

  /** Ensure role dropdown reflects the current route (creator, harmonizer, etc.). */
  private syncRoleWithCurrentRoute(url: string): void {
    const path = (url || '').split('?')[0];

    let targetRolePredicate: ((name: string) => boolean) | null = null;

    if (path === '/' || path === '') {
      // Creator landing
      targetRolePredicate = (name) => this.isCreatorLike(name);
    } else if (path === '/harmonizer') {
      targetRolePredicate = (name) => this.isHarmonizerLike(name);
    } else if (path === '/productprioritization') {
      targetRolePredicate = (name) => this.isProductPrioritizerLike(name);
    } else if (path === '/taprioritization') {
      targetRolePredicate = (name) => this.isTaPrioritizerLike(name);
    } else if (path === '/funding') {
      targetRolePredicate = (name) => this.isFunderLike(name);
    } else if (path.startsWith('/admin')) {
      targetRolePredicate = (name) => this.isAdminLike(name);
    }

    if (!targetRolePredicate) return;

    const match = this.roleOptions.find((r) =>
      targetRolePredicate!(this.normalizeRoleName(r.name))
    );
    if (!match) return;

    const control = this.filterForm.get('role');
    if (!control) return;

    // Avoid triggering navigation again when we programmatically sync.
    if (control.value !== match.id) {
      // Cast to satisfy FormControl<string | null> typing while keeping the
      // underlying numeric id so MatSelect can correctly match options.
      control.setValue(match.id as any, { emitEvent: false });
    }
  }

  /** Normalise role name for comparisons. */
  private normalizeRoleName(name: string | null | undefined): string {
    return (name || '').toLowerCase().trim();
  }

  private isCreatorLike(name: string): boolean {
    const n = this.normalizeRoleName(name);
    return (
      n.includes('creator') ||
      n === 'creator/approver' ||
      n.startsWith('creator ')
    );
  }

  private isHarmonizerLike(name: string): boolean {
    const n = this.normalizeRoleName(name);
    return n.includes('harmon');
  }

  private isProductPrioritizerLike(name: string): boolean {
    const n = this.normalizeRoleName(name);
    return n.includes('product') && n.includes('priorit');
  }

  private isTaPrioritizerLike(name: string): boolean {
    const n = this.normalizeRoleName(name);
    return n.includes('ta') && n.includes('priorit');
  }

  private isFunderLike(name: string): boolean {
    const n = this.normalizeRoleName(name);
    return n.includes('fund');
  }

  private isAdminLike(name: string): boolean {
    const n = this.normalizeRoleName(name);
    return n === 'admin';
  }

  /**
   * One-time auto-initialisation of TA, Franchise, and Function filters
   * based on the current user's assignments.
   *
   * Behaviour:
   * - If the user has therapeutic_areas, pick the first one:
   *   - Set TA filter to that TA.
   *   - Set Franchise filter to the TA's franchise_id (TA and franchise are linked).
   * - If the user has functions, pick a sensible default:
   *   - Prefer Business Function "Franchise" when available.
   *   - Otherwise prefer any Business Function.
   *   - Otherwise fall back to the first function.
   *
   * This runs only once per component lifecycle and only when the filters
   * are still empty, so it will not override manual user selections.
   */
  private tryInitializeFiltersFromUser(): void {
    if (this.initializedFromUser) return;
    if (!this.currentUser) return;
    if (!this.taOptions.length || !this.franchiseOptions.length) return;

    const taControl = this.filterForm.get('ta');
    const franchiseControl = this.filterForm.get('franchise');

    if (!taControl || !franchiseControl) return;

    // Only auto-initialise when TA and Franchise are still empty/null.
    const hasAnyValue =
      taControl.value !== null ||
      franchiseControl.value !== null;
    if (hasAnyValue) return;

    const userTa = (this.currentUser.therapeutic_areas ?? [])[0];
    if (userTa) {
      // Ensure that the TA exists in dropdown options before setting.
      const taExists = this.taOptions.some((ta) => ta.id === userTa.ta_id);
      if (taExists) {
        taControl.setValue(userTa.ta_id as any);
      }

      // Franchise is determined by the TA's franchise_id.
      const franchiseId = userTa.franchise_id;
      const franchiseExists = this.franchiseOptions.some(
        (f) => f.id === franchiseId
      );
      if (franchiseExists) {
        franchiseControl.setValue(franchiseId as any);
      }
    }

    this.initializedFromUser = true;
  }
}
