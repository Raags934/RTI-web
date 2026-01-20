export interface Product {
  product_id: number;
  product_name: string;
  product_type: string | null;
}


export interface Brand {
  brand_id: number;
  brand_name: string;
  products: Product[];
}

export interface FranchiseTherapeuticArea {
  ta_id: number;
  ta_name: string;
  brands: Brand[];
}

export interface Franchise {
  franchise_id: number;
  franchise_code: string;
  franchise_name: string;
  therapeutic_areas: FranchiseTherapeuticArea[];
}
