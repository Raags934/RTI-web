import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { Buttons } from '../../../shared/components/buttons/buttons';
import { CommonModule } from '@angular/common';
import { FormInput, DropdownOption } from '../../../shared/components/form-input/form-input';
import { PopUp } from '../../../shared/components/popup/popup';
import { AdminTaTable } from '../admin-ta-table/admin-ta-table';

@Component({
  selector: 'app-admin-edit-product-list',
  standalone: true,
  imports: [CommonModule, Buttons, FormInput, PopUp, AdminTaTable],
  templateUrl: './admin-edit-product-list.html',
  styleUrls: ['./admin-edit-product-list.scss'],
})
export class AdminEditProductList implements OnInit {
  searchControl = new FormControl<string>('');
  // Franchise dropdown options
  franchiseOptions: DropdownOption[] = [
    { id: 'Surgical', name: 'Surgical' },
    { id: 'Contact Lens', name: 'Contact Lens' },
    { id: 'Pharma', name: 'Pharma' },
    { id: 'OTC', name: 'OTC' }
  ];

  therapeuticAreaList: DropdownOption[] = [
    { id: 'Monofcal IOL', name: 'Monofcal IOL' },
    { id: 'PCIOL', name: 'PCIOL' },
    { id: 'CRDX', name: 'CRDX' },
    { id: 'SX Galucoma', name: 'SX Galucoma' },
    { id: 'SX Retina', name: 'SX Retina' },
    { id: 'Refractive Suite', name: 'Refractive Suite' },
    { id: 'Cataract Refractive Consumables', name: 'Cataract Refractive Consumables' }
  ];

  familyBrandList: DropdownOption[] = [
    { id: 'PanOptix', name: 'PanOptix' },
    { id: 'Tears Naturale', name: 'Tears Naturale' },
    { id: 'Naphcon A', name: 'Naphcon A' },
    { id: 'Grieshaber', name: 'Grieshaber' },
    { id: 'Non-Product Specific', name: 'Non-Product Specific' },
    { id: 'Simbrinza', name: 'Simbrinza' },
    { id: 'Rhopressa', name: 'Rhopressa' },
    { id: 'Monarch III', name: 'Monarch III' },
    { id: 'Patanol S', name: 'Patanol S' },
    { id: 'PRECISION7', name: 'PRECISION7' }
  ];

  expandedFranchises: Set<number> = new Set();
  // Form for Add/Edit Franchise popup
  franchiseForm = new FormGroup({
    franchiseName: new FormControl<string>(''),
    franchiseCode: new FormControl<string>(''),
    status: new FormControl<string>('active')
  });
  franchises: any[] = [];




  familyBrandForm = new FormGroup({
    brandName: new FormControl<string>(''),
    brandCode: new FormControl<string>(''),
    status: new FormControl<string>('active'),
    franchise: new FormControl<string>(''),
    therapeuticArea: new FormControl<string>(''),

  });

  // Form for Add Therapeuti Area popup
  therapeutiAreaForm = new FormGroup({
    franchiseName: new FormControl<string>(''),
    therapeutiAreaName: new FormControl<string>(''),
    therapeutiAreaCode: new FormControl<string>('')
  });

  // Form for Edit Therapeuti Area popup
  editTherapeuticAreaForm = new FormGroup({
    franchiseName: new FormControl<string>(''),
    therapeutiAreaName: new FormControl<string>(''),
    therapeutiAreaCode: new FormControl<string>('')
  });

  productsProjects = [
    { product_id: 1, product_name: 'Product A', product_code: 'P-A' },
    { product_id: 2, product_name: 'Project B', product_code: 'P-B' },
    { product_id: 3, product_name: 'Product C', product_code: 'P-C' }
  ];



  // Popup visibility control
  showAddFranchisePopup = false;
  showEditFranchisePopup = false;
  showAddFamilyBrandPopup = false;
  showEditFamilyBrandPopup = false;
  isFranchiseExpanded = false;

  /**
   * Returns true if the given franchise id is expanded.
   */
  isFranchiseExpandedFn(id: number): boolean {
    return this.expandedFranchises.has(id);
  }
  isTitleProductExpanded = false;
  isProductsProjectsExpanded = false;
  showAddProductProjectPopup = false;
  showEditProductProjectPopup = false;
  showAddTherapeutiAreaPopup = false;
  showEditTherapeutiAreaPopup = false;
  // Therapeutic Area expand/collapse state
  isTherapeuticAreaExpanded = false;


  expandedProductProjects: Set<number> = new Set();



  toggleFranchise(id?: number) {
    if (id !== undefined) {
      // Toggle individual franchise
      if (this.expandedFranchises.has(id)) {
        this.expandedFranchises.delete(id);
      } else {
        this.expandedFranchises.add(id);
      }
    } else {
      // Toggle all (header click without id)
      this.isFranchiseExpanded = !this.isFranchiseExpanded;
    }
  }

  toggleTitleProduct() {
    this.isTitleProductExpanded = !this.isTitleProductExpanded;
  }

  toggleProductsProjects() {
    this.isProductsProjectsExpanded = !this.isProductsProjectsExpanded;
  }

  toggleProductProject(id: number) {
    if (this.expandedProductProjects.has(id)) {
      this.expandedProductProjects.delete(id);
    } else {
      this.expandedProductProjects.add(id);
    }
  }

  isProductProjectExpanded(id: number): boolean {
    return this.expandedProductProjects.has(id);
  }

  //  constructor(private router: Router) {}
  productProjectForm!: FormGroup;

  constructor(private router: Router, private fb: FormBuilder) {
    this.productProjectForm = this.fb.group({
      status: ['active'],
      franchise: [null],
      therapeuticArea: [null],
      familyBrand: [null],
      productProjectName: ['']
    });
  }

  ngOnInit(): void {
    // Initialization logicz
  }

  onBackClick() {
    this.router.navigate(['/admin']);
  }

  // onImportProductListClick() {
  //   console.log('Import Product List clicked');
  // }

  onAddFranchiseClick() {
    this.showAddFranchisePopup = true;
    console.log('Add Franchise clicked');
  }

  onEditFranchiseClick() {
    this.showEditFranchisePopup = true;
    console.log('Edit Franchise clicked');
  }

  onSearchChange(value: string) {
    console.log('Search value:', value);
  }

  closeAddFranchisePopup() {
    this.showAddFranchisePopup = false;
    this.franchiseForm.reset();
  }

  closeEditFranchisePopup() {
    this.showEditFranchisePopup = false;
    this.franchiseForm.reset();
  }

  onAddFranchiseSubmit() {
    console.log('Add Franchise submitted');
    this.closeAddFranchisePopup();
  }

  onEditFranchiseSubmit() {
    console.log('Edit Franchise submitted');
    this.closeEditFranchisePopup();
  }

  onAddTherapeuticAreaSubmit() {
    if (this.therapeutiAreaForm.valid) {
      const therapeutiAreaName = this.therapeutiAreaForm.get('therapeutiAreaName')?.value;
      const therapeutiAreaCode = this.therapeutiAreaForm.get('therapeutiAreaCode')?.value;

      console.log('Adding Therapeutic Area:', { therapeutiAreaName, therapeutiAreaCode });

      // TODO: Implement API call to save franchise
      // After successful save, close the popup
      this.closeAddTherapeuticAreaPopup();
    } else {
      console.log('Form is invalid');
      this.therapeutiAreaForm.markAllAsTouched();
    }
  }
  onEditTherapeuticAreaSubmit() {
    if (this.editTherapeuticAreaForm.valid) {
      const therapeutiAreaName = this.editTherapeuticAreaForm.get('therapeutiAreaName')?.value;
      const therapeutiAreaCode = this.editTherapeuticAreaForm.get('therapeutiAreaCode')?.value;

      console.log('Editing Therapeutic Area:', { therapeutiAreaName, therapeutiAreaCode });

      // TODO: Implement API call to update therapeutic area
      // After successful update, close the popup
      this.closeEditTherapeuticAreaPopup();
    } else {
      console.log('Form is invalid');
      this.editTherapeuticAreaForm.markAllAsTouched();
    }
  }

  toggleTherapeuticArea() {
    this.isTherapeuticAreaExpanded = !this.isTherapeuticAreaExpanded;
    console.log('Therapeutic Area expanded:', this.isTherapeuticAreaExpanded);
  }

  onAddTherapeutiAreaClick() {
    this.showAddTherapeutiAreaPopup = true;
    console.log('Add Therapeuti Area clicked');
  }

  onEditTherapeuticAreaClick() {
    this.showEditTherapeutiAreaPopup = true;
    console.log('Edit Therapeuti Area clicked');
  }

  closeAddTherapeuticAreaPopup() {
    this.showAddTherapeutiAreaPopup = false;
    this.therapeutiAreaForm.reset();

  }

  closeEditTherapeuticAreaPopup() {
    this.showEditTherapeutiAreaPopup = false;
    this.editTherapeuticAreaForm.reset();
  }

  // ── Add with your other click handlers ──
  onAddFamilyBrandClick() {
    this.showAddFamilyBrandPopup = true;
    console.log('Add Product Family/Brand clicked');
  }

  onEditFamilyBrandClick() {
    this.showEditFamilyBrandPopup = true;
    console.log('Edit Product Family/Brand clicked');
  }

  // ── Add with your popup close methods ──
  closeAddFamilyBrandPopup() {
    this.showAddFamilyBrandPopup = false;
    this.familyBrandForm.reset({
      brandName: '',
      brandCode: '',
      status: 'active',
    });
  }

  closeEditFamilyBrandPopup() {
    this.showEditFamilyBrandPopup = false;
    this.familyBrandForm.reset({
      brandName: '',
      brandCode: '',
      status: 'active',
    });
  }

  // ── Add with your submit handlers ──
  onAddFamilyBrandSubmit() {
    console.log('Add Product Family/Brand submitted', this.familyBrandForm.value);
    this.closeAddFamilyBrandPopup();
  }

  onEditFamilyBrandSubmit() {
    console.log('Edit Product Family/Brand submitted', this.familyBrandForm.value);
    this.closeEditFamilyBrandPopup();
  }
  onAddProductProjectClick() {
    console.log('Add Product/Project clicked');
    this.showAddProductProjectPopup = true;
  }

  onEditProductProjectClick() {
    console.log('Edit Product/Project clicked');
    this.showEditProductProjectPopup = true;
  }


  closeAddProductProjectPopup() {
    this.showAddProductProjectPopup = false;
  }

  onAddProductProjectSubmit() {
    if (this.productProjectForm.valid) {
      // handle submit
    } else {
      this.productProjectForm.markAllAsTouched();

    }
  }

  closeEditProductProjectPopup() {
    this.showEditProductProjectPopup = false;
    this.productProjectForm.reset({
      status: 'active'
    });
  }

  onEditProductProjectSubmit() {
    if (this.productProjectForm.valid) {
      console.log('Edit Product/Project submitted', this.productProjectForm.value);
      this.closeEditProductProjectPopup();
    } else {
      this.productProjectForm.markAllAsTouched();
    }
  }
  // --- Import Product List popup state ---
  showImportProductListPopup = false;

  // Selected file + UI state
  importFile: File | null = null;
  importFileName: string | null = null;
  importFileError: string | null = null;

  // 25 MB in bytes
  private readonly MAX_IMPORT_SIZE = 25 * 1024 * 1024;

  // Allowed extensions
  private readonly ALLOWED_IMPORT_EXTS = ['csv', 'xls', 'xlsx'];

  // Open popup from the top button
  onImportProductListClick(): void {
    // Clear previous state before opening
    this.resetImportState();
    this.showImportProductListPopup = true;
  }

  // Close popup via back arrow
  closeImportProductListPopup(): void {
    this.showImportProductListPopup = false;
    // Ensure cleanup so the next open is clean
    this.resetImportState();
  }

  private resetImportState(): void {
    this.importFile = null;
    this.importFileName = null;
    this.importFileError = null;
  }

  // // Handle <input type="file"> selection
  onImportFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input?.files || input.files.length === 0) {
      this.importFile = null;
      this.importFileName = null;
      this.importFileError = null;
      return;
    }

    const file = input.files[0];
    const name = file.name || '';

    // Validate extension
    const ext = name.split('.').pop()?.toLowerCase() || '';
    const isAllowedExt = this.ALLOWED_IMPORT_EXTS.includes(ext);

    // Validate size
    const isUnderSize = file.size <= this.MAX_IMPORT_SIZE;

    if (!isAllowedExt) {
      this.importFile = null;
      this.importFileName = null;
      this.importFileError = 'Unsupported file type. Please upload CSV/XLS/XLSX.';
      return;
    }

    if (!isUnderSize) {
      this.importFile = null;
      this.importFileName = null;
      this.importFileError = 'File is too large. Maximum allowed size is 25 MB.';
      return;
    }

    // Valid file
    this.importFile = file;
    this.importFileName = name;
    this.importFileError = null;
  }
  // onImportFileSelected(event: Event, fileInput: HTMLInputElement) {
  //   const input = event.target as HTMLInputElement;

  //   if (!input.files || input.files.length === 0) {
  //     return;
  //   }

  //   const file = input.files[0];
  //   this.importFile = file;
  //   this.importFileName = file.name;
  //   this.importFileError = null;

  //   // Reset input so selecting the same file again still triggers change
  //   fileInput.value = "";
  // }

  // Click on "Update"
  onImportProductListUpdate(): void {
    if (!this.importFile) {
      this.importFileError = 'Please select a file to upload.';
      return;
    }

    // For now, mimic success:
    console.log('Uploading file:', this.importFileName, this.importFile?.size, 'bytes');
    this.closeImportProductListPopup();
  }

}
