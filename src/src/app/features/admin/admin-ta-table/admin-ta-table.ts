import { Component, OnInit,Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableColumn } from '../../../shared/components/table/table';
import { StatusTab } from '../../../shared/constants/statusTabs';

export interface TherapeuticAreaData {
  ta_id: number;
  ta_name: string;
  ta_code: string;
  status: string;
}


export interface FranchiseRow {
  franchise_id: number;
  franchise_name: string;
  franchise_code: string;
  status: string; // e.g., 'Active'
}

export interface FamilyBrandRow {
  fb_id: number;
  fb_name: string;   // long column
  status: string;    // always 'Active'
}

/** ✅ Products/Projects row shape */
export interface ProductProjectRow {
  pp_id: number;
  pp_name: string;  // Product Name (long column)
  status: string;   // e.g., 'Active'
}



@Component({
  selector: 'app-admin-ta-table',
  standalone: true,
  imports: [CommonModule, Table],
  templateUrl: './admin-ta-table.html',
  styleUrls: ['./admin-ta-table.scss'],
})
export class AdminTaTable implements OnInit,OnChanges {
  @Input() searchText: string = '';
  @Input() tableType: 'ta' | 'franchise' | 'familyBrand'|'productProject' = 'ta';

  ngOnChanges() {
  this.applySearchFilter();
}
applySearchFilter() {
  const term = this.searchText.trim().toLowerCase();

  if (this.tableType === 'franchise') {
    this.filteredFranchises = this.allFranchises.filter(f =>
      f.franchise_name.toLowerCase().includes(term) ||
      f.franchise_code.toLowerCase().includes(term) ||
      String(f.franchise_id).includes(term)
    );
  }
 
if (this.tableType === 'ta') {
  this.filteredTherapeuticAreas = this.allTherapeuticAreas.filter(t =>
    t.ta_name.toLowerCase().includes(term) ||
    t.ta_code.toLowerCase().includes(term) ||
    String(t.ta_id).includes(term)
  );
}


  if (this.tableType === 'familyBrand') {
    this.filteredFamilyBrands = this.allFamilyBrands.filter(b =>
      b.fb_name.toLowerCase().includes(term) ||
      String(b.fb_id).includes(term)
    );
  }

  if (this.tableType === 'productProject') {
    this.filteredProductProjects = this.allProductProjects.filter(p =>
      p.pp_name.toLowerCase().includes(term) ||
      String(p.pp_id).includes(term)
    );
  }

  if (this.tableType === 'ta') {
    this.filteredTherapeuticAreas = this.allTherapeuticAreas.filter(t =>
      t.ta_name.toLowerCase().includes(term) ||
      t.ta_code.toLowerCase().includes(term) ||
      String(t.ta_id).includes(term)
    );
  }
}


  // Table columns
  taDisplayColumns: TableColumn[] = [
    { key: 'ta_id', label: 'ID', sortable: true, width: 'small' },
    { key: 'ta_name', label: 'Therapeutic Area', sortable: true, width: 'medium' },
    { key: 'ta_code', label: 'Code', sortable: true, width: 'small' },
    { key: 'status', label: 'Status', sortable: true, width: 'small' },
  ];

  // Status tabs for filtering by therapeutic area
  taStatusTabs: StatusTab[] = [
    { label: 'All', status_id: 0, count: 0 },
    { label: 'Monofcal IOL', status_id: 1, count: 0 },
    { label: 'PCIOL', status_id: 2, count: 0 },
    { label: 'CRDX', status_id: 3, count: 0 },
    { label: 'SX Galucoma', status_id: 4, count: 0 },
    { label: 'SX Retina', status_id: 5, count: 0 },
    { label: 'Refractive Suite', status_id: 6, count: 0 },
    { label: 'Cataract Refractive Consumables', status_id: 7, count: 0 },
  ];

  // Sample data - in real app, this would come from a service/store
  allTherapeuticAreas: TherapeuticAreaData[] = [
    { ta_id: 1, ta_name: 'Monofcal IOL', ta_code: 'MON-IOL', status: 'Active' },
    { ta_id: 2, ta_name: 'PCIOL', ta_code: 'PCIOL', status: 'Active' },
    { ta_id: 3, ta_name: 'CRDX', ta_code: 'CRDX', status: 'Active' },
    { ta_id: 4, ta_name: 'SX Galucoma', ta_code: 'SX-GLU', status: 'Active' },
    { ta_id: 5, ta_name: 'SX Retina', ta_code: 'SX-RET', status: 'Active' },
    { ta_id: 6, ta_name: 'Refractive Suite', ta_code: 'REF-SU', status: 'Active' },
    { ta_id: 7, ta_name: 'Cataract Refractive Consumables', ta_code: 'CAT-REF', status: 'Active' },
  ];

  filteredTherapeuticAreas: TherapeuticAreaData[] = [];
  currentFilterTaId: number = 0;

 
 /* -------------------------------
   * Franchise TABLE (new)
   * ------------------------------- */
  franchiseDisplayColumns: TableColumn[] = [
    { key: 'franchise_id', label: 'Id', sortable: true, width: 'small' },
    // Make Franchise Name the long column
    { key: 'franchise_name', label: 'Franchise Name', sortable: true, width: 'large' },
    { key: 'franchise_code', label: 'Code', sortable: true, width: 'small' },
    { key: 'status', label: 'Status', sortable: true, width: 'small' },
  ];
 
 /** Data you provided */
  allFranchises: FranchiseRow[] = [
    { franchise_id: 1, franchise_name: 'Surgical',      franchise_code: 'SG', status: 'Active' },
    { franchise_id: 2, franchise_name: 'Contact Lens',  franchise_code: 'CL', status: 'Active' },
    { franchise_id: 3, franchise_name: 'Pharma',        franchise_code: 'PH', status: 'Active' },
    { franchise_id: 4, franchise_name: 'OTC',           franchise_code: 'OT', status: 'Active' },
  ];
   filteredFranchises: FranchiseRow[] = [];

   
 /* -------------------------------
   * ✅ Product Family/Brand TABLE (new)
   * ------------------------------- */
  familyBrandDisplayColumns: TableColumn[] = [
    { key: 'fb_id', label: 'Id', sortable: true, width: 'small' },
    { key: 'fb_name', label: 'Brand Name', sortable: true, width: 'large' }, // long column
    { key: 'status', label: 'Status', sortable: true, width: 'small' },
  ];

 
 /** Your provided rows (all status = Active) */
  allFamilyBrands: FamilyBrandRow[] = [
    { fb_id: 1,  fb_name: 'PanOptix',          status: 'Active' },
    { fb_id: 2,  fb_name: 'Tears Naturale',    status: 'Active' },
    { fb_id: 3,  fb_name: 'Naphcon A',         status: 'Active' },
    { fb_id: 4,  fb_name: 'Grieshaber',        status: 'Active' },
    { fb_id: 5,  fb_name: 'Non-Product Specific', status: 'Active' },
    { fb_id: 6,  fb_name: 'Simbrinza',         status: 'Active' },
    { fb_id: 7,  fb_name: 'Rhopressa',         status: 'Active' },
    { fb_id: 8,  fb_name: 'Monarch III',       status: 'Active' },
    { fb_id: 9,  fb_name: 'Patanol S',         status: 'Active' },
    { fb_id: 10, fb_name: 'PRECISION7',        status: 'Active' },
  ];
   filteredFamilyBrands: FamilyBrandRow[] = [];

   
/* -------------------------------
   * ✅ Products/Projects TABLE
   * ------------------------------- */
  productProjectDisplayColumns: TableColumn[] = [
    { key: 'pp_id', label: 'Id', sortable: true, width: 'small' },
    { key: 'pp_name', label: 'Product Name', sortable: true, width: 'large' }, // long column
    { key: 'status', label: 'Status', sortable: true, width: 'small' },
  ];
 
/** Your provided rows (all Status = Active) */
  allProductProjects: ProductProjectRow[] = [
    { pp_id: 1,  pp_name: 'DAILIES TOTAL1 Multifocal', status: 'Active' },
    { pp_id: 2,  pp_name: 'Systane Ultra',             status: 'Active' },
    { pp_id: 3,  pp_name: 'Clareon',                   status: 'Active' },
    { pp_id: 4,  pp_name: 'Polyrinse',                 status: 'Active' },
    { pp_id: 5,  pp_name: 'Grieshaber Reflex Long',    status: 'Active' },
    { pp_id: 6,  pp_name: 'Inveltys',                  status: 'Active' },
    { pp_id: 7,  pp_name: 'Systane PRO',               status: 'Active' },
    { pp_id: 8,  pp_name: 'AIR OPTIX',                 status: 'Active' },
    { pp_id: 9,  pp_name: 'Systane Ultra PF',          status: 'Active' },
    { pp_id: 10, pp_name: 'FreshLook One-Day Colors',  status: 'Active' },
  ];
   filteredProductProjects: ProductProjectRow[] = [];

  ngOnInit() {
    this.filteredTherapeuticAreas = [...this.allTherapeuticAreas];
   
    this.updateStatusCounts();
    this.filteredFranchises = [...this.allFranchises];
    this.filteredFamilyBrands = [...this.allFamilyBrands];
    this.filteredProductProjects = [...this.allProductProjects];
  }

  updateStatusCounts() {
    this.taStatusTabs.forEach((tab) => {
      if (tab.status_id && tab.status_id > 0) {
        tab.count = this.allTherapeuticAreas.filter(
          (ta) => ta.ta_id === tab.status_id
        ).length;
      } else {
        tab.count = this.allTherapeuticAreas.length;
      }
    });
  }

  filterByTa(taId: number) {
    this.currentFilterTaId = taId;
    if (taId === 0) {
      this.filteredTherapeuticAreas = [...this.allTherapeuticAreas];
    } else {
      this.filteredTherapeuticAreas = this.allTherapeuticAreas.filter(
        (ta) => ta.ta_id === taId
      );
    }
  }
}
