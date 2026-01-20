import { Functions } from "./function.model";
import { ResearchPathway } from "./research-pathway.model";
import { Role } from "./role.model";
import { TherapeuticArea } from "./therapeutic-area.model";

export interface User {
  user_id: number | null;
  name: string | null;
  email: string | null;
  active?: boolean | null;
  flag_soft_lock?: boolean | null;
  created_at?: string | null;
  roles: Role[];
  functions: Functions[];
  therapeutic_areas: TherapeuticArea[];
  research_pathways: ResearchPathway[];
}
