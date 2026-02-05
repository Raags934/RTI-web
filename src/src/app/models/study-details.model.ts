/**
 * Payload for POST /study_details (Enter Study Details form submit).
 * Matches API contract; created_by is set by client (e.g. hardcoded) until auth is integrated.
 */
export interface StudyDetailsPayload {
  idea_id: number;
  study_type: string;
  research_question: string;
  potential_claims: string;
  primary_endpoints: string;
  secondary_endpoints: string;
  estimated_start_date: string; // YYYY-MM-DD
  estimated_end_date: string;   // YYYY-MM-DD
  estimated_sample_size: number;
  total_estimated_budget: number;
  budget_currency: string;
  estimated_spend_plus_1: number;
  estimated_spend_plus_2: number;
  estimated_spend_plus_3: number;
  pos: number;
  regions_accepting_submissions: string;
  created_by: number;
}
