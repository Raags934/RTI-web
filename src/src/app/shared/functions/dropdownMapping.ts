import { DropdownOption } from '../../models/DropDownOption';
import { Franchise } from '../../models/productsList.model';
import { User } from '../../models/user.model';

export function mapFranchisesToDropdown(franchises: Franchise[]): DropdownOption[] {
  return franchises.map((f) => ({
    id: f.franchise_id,
    name: f.franchise_name,
  }));
}

export function mapTAsToDropdown(franchises: Franchise[]): DropdownOption[] {
  return franchises.flatMap((f) =>
    f.therapeutic_areas.map((ta) => ({
      id: ta.ta_id,
      name: ta.ta_name,
      franchise_id: f.franchise_id,
    }))
  );
}

export function mapBrandsToDropdown(franchises: Franchise[]): DropdownOption[] {
  return franchises.flatMap((f) =>
    f.therapeutic_areas.flatMap((ta) =>
      ta.brands.map((b) => ({
        id: b.brand_id,
        name: b.brand_name,
        franchise_id: f.franchise_id,
        ta_id: ta.ta_id,
      }))
    )
  );
}
export function mapProductsToDropdown(franchises: Franchise[]): DropdownOption[] {
  return franchises.flatMap((f) =>
    f.therapeutic_areas.flatMap((ta) =>
      ta.brands.flatMap((b) =>
        b.products.map((p) => ({
          id: p.product_id,
          name: p.product_name,
          franchise_id: f.franchise_id,
          ta_id: ta.ta_id,
          brand_id: b.brand_id,
        }))
      )
    )
  );
}

export function mapRolesToDropdown(user: User): DropdownOption[] {
  return user.roles.map((r) => ({
    id: r.role_id,
    name: r.role_name,
  }));
}

export function mapFunctionsToDropdown(user: User): DropdownOption[] {
  return user.functions.map((f) => ({
    id: f.function_id,
    name: f.function_name,
  }));
}

export function mapValueListToDropdown(list: any[]): DropdownOption[] {
  return list.map((item) => ({
    id: item.value_code, // or item.value_id if you prefer
    name: item.value_label,
  }));
}

export function getRtiYearDropdown(years: number = 5): DropdownOption[] {
  const currentYear = new Date().getFullYear();

  return Array.from({ length: years }).map((_, i) => ({
    id: currentYear + i,
    name: String(currentYear + i)
  }));
}


export function getLaunchClaimDropdown(): DropdownOption[] {
  return [
    { id: 1,  name: 'Yes' },
    { id: 2, name: 'No' }
  ];
}

export function mapResearchPathwayToDropdown(list: any[]): DropdownOption[] {
  return list.map(item => ({
    id: item.pathway_id,
    name: item.pathway_name
  }));
}



