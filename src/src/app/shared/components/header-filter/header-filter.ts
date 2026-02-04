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

  constructor(private store: Store<AppState>, private eventService: IdeaEventsService) {
    this.user$ = this.store.select((state) => state.masterData?.data?.user);
    this.franchises$ = this.store.select((state) => state.masterData?.data?.franchises);

    // Emit on ANY filter change
    this.filterForm.valueChanges.subscribe((value) => {
      //this.filterChange.emit(value);
    });
  }
  ngOnInit(): void {
    this.user$.subscribe((user) => {
      if (!user) return;

      this.roleOptions = mapRolesToDropdown(user);
      this.functionsOptions = mapFunctionsToDropdown(user);
      this.groupsOptions = mapFunctionsToDropdown(user);
    });

    this.franchises$.subscribe((list) => {
      if (!list) return;

      this.franchiseOptions = mapFranchisesToDropdown(list);
      this.taOptions = mapTAsToDropdown(list);
    });

    // this.sub = this.eventService.events$.subscribe((event) => {
    //   if (event.type === 'franchiseFilterChange') {
    //     this.applyFilter(event.payload);
    //   }

    // 🔥 TA-specific change listener
    this.filterForm.get('ta')?.valueChanges.subscribe((taId) => {
      if (!taId) return;
      this.eventService.taFilterChange(Number(taId));

      // // Emit TA change event
      // this.filterChange.emit({
      //   ...this.filterForm.value,
      //   ta: taId
      // });

      // Optional: auto-filter franchises
      // this.filterFranchisesByTA(taId);
    });
    this.filterForm.get('franchise')?.valueChanges.subscribe((franchiseId) => {
      if (!franchiseId) return;
   
      // Raise event for franchise change
      //this.eventService.franchiseFilterChange(Number(franchiseId));
      console.log(franchiseId)
   
      // Or emit through your component output
      // this.filterChange.emit({
      //   ...this.filterForm.value,
      //   franchise: franchiseId
      // });
    });
   
  }

  // // Optional helper if needed
  // filterFranchisesByTA(taId: string | number) {
  //   this.franchiseOptions = this.franchiseOptions.filter(f =>
  //     (f as any).ta_ids?.includes(taId)
  //   );
  // }
}
