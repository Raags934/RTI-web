import { Status } from "./status.model";
import { ResearchPathway } from "./research-pathway.model";
import { Franchise } from "./franchise.model";
import { Brand } from "./brand.model";
import { TherapeuticArea } from "./therapeutic-area.model";
import { Product } from "./product.model";
import { User } from "./user.model";

export interface Idea {
  idea_id: number;
  idea_uid: string;
  status_id: number;
  pathway_id: number;
  rti_year: number;
  product_type: string;
  franchise_id: number;
  ta_id: number;
  brand_id: number;
  product_id: number;
  origin_request: string;
  strategic_rationale: string;
  monadic_or_comparative: string;
  target_aspirational_claim: string;
  research_proposal: string | null;
  launch_claim: boolean;
  rti_unique_id: string | null;
  pos: string | null;
  pos_reasons: string;
  ranking_brand: string | null;
  ranking_franchise: string | null;
  funding_source: string;
  flag_unlock: boolean;
  created_at: string;
  updated_at: string;
  status: Status;
  research_pathway: ResearchPathway;
  franchise: Franchise;
  brand: Brand;
  product: Product;
  therapeutic_area: TherapeuticArea;
  created_by: User;
  updated_by: User | null;
}

export interface IdeaPayload {
  pathway_id: number;
  rti_year: number;
  product_type: string;
  product_id: number;
  brand_id: number;
  ta_id: number;
  franchise_id: number;
  origin_request: string;
  strategic_rationale: string;
  monadic_or_comparative: string;
  target_aspirational_claim: string;
  research_proposal: string;
  launch_claim: boolean;
  created_by: number;
  updated_by: number;
}

export interface ExportIdeasPayload {
  id: number[];
}
