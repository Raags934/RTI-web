import { TableColumn } from "../components/table/table";

export const ideaDisplayColumns: TableColumn[] = [
    { key: 'rti_unique_id', label: 'RTI UID', sortable: true, width: 'medium' },
    { key: 'idea_uid', label: 'UID', sortable: true, width: 'small' },
    { key: 'franchise.franchise_name', label: 'Franchise', sortable: true, width: 'small' },
    { key: 'therapeutic_area.ta_name', label: 'Therapeutic Area', sortable: true, width: 'small' },
    { key: 'brand.brand_name', label: 'Product Family (Brand)', sortable: true, width: 'medium' },
    { key: 'product_type', label: 'Product Type', sortable: true, width: 'medium' },
    { key: 'product.product_name', label: 'Product / Project', sortable: true, width: 'medium' },
    { key: 'TAC_or_RP', label: 'Target Aspirational Claim / Research Proposal', sortable: true, width: 'large' },
    { key: 'status.status_name', label: 'Status', sortable: true, width: 'small' },
    { key: 'options', label: '', sortable: false, width: 'xsmall' }
  ];  