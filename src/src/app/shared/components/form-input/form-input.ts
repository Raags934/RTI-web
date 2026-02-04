import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TextFieldModule } from '@angular/cdk/text-field';
import { IdeaEventsService } from '../../../events/ideaServiceEvents';

export interface DropdownOption<T = any> {
  id: T;
  name: string;
}

@Component({
  selector: 'app-form-input',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TextFieldModule,
  ],
  templateUrl: './form-input.html',
  styleUrl: './form-input.scss',
})
export class FormInput<T = any> implements OnInit {
  /* ------------------------------
     Inputs
  ------------------------------ */
  @Input() label!: string;
  @Input() type: 'text' | 'textarea' | 'select' | 'date' = 'text';
  @Input() placeholder = '';
  @Input() options: DropdownOption<T>[] = [];
  @Input() required = false;
  @Input() searchPlaceholder = 'Search';
  @Input() isDisabled = false;
  @Input() labelRequired = true;
  @Input() dropdownSize: 'standard' | 'small' = 'standard';
  @Input() showSearchDropdown = true;
  @Input() showIconDropdown = true;
  @Input() autoSelectFirst = false;

  /** Reactive form control passed from parent */
  @Input() control!: AbstractControl | null;

  /* ------------------------------
     Outputs
  ------------------------------ */
  @Output() valueChange = new EventEmitter<T | string>();

  /* ------------------------------
     Internal state
  ------------------------------ */
  search = new FormControl<string>('');
  submitted = false;
  //defaultOption = this.options.find(o => o.id === 1);

  /* ------------------------------
     Safe getter
  ------------------------------ */
  get formControl(): FormControl {
    return this.control as FormControl;
  }


  get controlName(): string | null {
    if (!this.control || !this.control.parent) return null;
 
    const parent = this.control.parent as any;
 
    return Object.keys(parent.controls).find(
      key => parent.controls[key] === this.control
    ) || null;
  }

  constructor(private eventService: IdeaEventsService){}
 
  /* ------------------------------
     Lifecycle
  ------------------------------ */
  ngOnInit(): void {
    //Disable search if options less than or equal to 5
    if (
      this.type === 'select' &&
      this.options.length <= 5 ) {
        this.showSearchDropdown = false;
      }
    // Auto-select first option
    if (
      this.type === 'select' &&
      this.autoSelectFirst &&
      this.options.length > 0 &&
      !this.control?.value
    ) {
      this.control?.setValue(this.options[0].id, { emitEvent: false });
      if(this.controlName === 'ta'){
        this.eventService.taFilterChange(Number(this.options[0].id))
      }
      if(this.controlName === 'franchise'){
        this.eventService.franchiseFilterChange(Number(this.options[0].id))
      }
    }

    // Handle disabled state
    if (this.isDisabled) {
      this.control?.disable({ emitEvent: false });
    } else {
      this.control?.enable({ emitEvent: false });
    }
  }

  /* ------------------------------
     Event handlers
  ------------------------------ */
  onSelectionChange(value: T | null): void {
    this.valueChange.emit(value as T);
  }

  /* ------------------------------
     Filtered dropdown options
  ------------------------------ */
  get filteredOptions(): DropdownOption<T>[] {
    const term = (this.search.value ?? '').toLowerCase().trim();
    return term
      ? this.options.filter(o => o.name.toLowerCase().includes(term))
      : this.options;
  }

  /* ------------------------------
     Validation helper
  ------------------------------ */
  markSubmitted(markTouched = true): void {
    this.submitted = true;

    if (markTouched && this.control) {
      this.control.markAsTouched();
    }
  }
}
