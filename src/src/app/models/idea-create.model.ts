
import { FormControl } from '@angular/forms';

// This is the VALUE shape (what you submit)
export interface IdeaFormValue {
  product_or_project: number | null;
  therapeutic_area: number | null;
  product_type: string | null;
  research_pathway: string | null;
  product_family_brand: number | null;
  rti_year: number | null;
  franchise_auto: number | null;
  monadic_or_comparative: 'Monadic' | 'Comparative' | null;
  origin_request: string | null;
  strategic_rationale: string | null;
  target_aspirational_claim: string | null;
  launch_claim: 'Yes' | 'No' | null;
}

// This is the CONTROLS shape (what FormGroup needs)
export type IdeaFormControls = {
  [K in keyof IdeaFormValue]: FormControl<IdeaFormValue[K]>;
};
