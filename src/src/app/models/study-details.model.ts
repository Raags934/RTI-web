/**
 * Minimal payload for POST /study_details when user selects "Is the study recommended?" = No.
 * Only these fields are sent; no other study detail fields.
 */
export interface StudyDetailsMinimalPayload {
  idea_id: number;
  /** Set only when study details already exist for this idea (e.g. edit); omit for new study details. */
  study_id?: number;
  is_recommended: boolean;
  pos: number;
  pos_reasons: string;
  created_by: number;
}

/**
 * Payload for POST /study_details (Enter Study Details form submit).
 * Matches API contract; created_by is set by client (e.g. hardcoded) until auth is integrated.
 * Used when Pilot Study toggle is No (study details only).
 */
export interface StudyDetailsPayload {
  idea_id: number;
  /** Set only when study details already exist for this idea (e.g. edit); omit for new study details. */
  study_id?: number;
  is_recommended: boolean;
  research_question: string;
  potential_claims: string;
  primary_endpoints: string;
  secondary_endpoints: string;
  other_potential_endpoints: string;
  proposed_study_design: string;
  proposed_statistics: string;
  estimated_start_date: string; // YYYY-MM-DD
  estimated_end_date: string;   // YYYY-MM-DD
  estimated_sample_size: number;
  total_estimated_budget: number;
  budget_currency: string;
  estimated_spend_plus_1: number;
  estimated_spend_plus_2: number;
  estimated_spend_plus_3: number;
  pos: number;
  pos_reasons: string;
  regions_accepting_submissions: string;
  created_by: number;
}

/**
 * Extended payload for POST /study_details when Pilot Study toggle is Yes.
 * Includes both study details and pilot details in a single request.
 */
export interface StudyDetailsWithPilotPayload {
  idea_id: number;
  /** Set only when study details already exist for this idea (e.g. edit); omit for new study details. */
  study_id?: number;
  is_recommended: boolean;
  pos_reasons: string;
  research_question: string;
  potential_claims: string;
  primary_endpoints: string;
  secondary_endpoints: string;
  other_potential_endpoints: string;
  proposed_study_design: string;
  proposed_statistics: string;
  estimated_start_date: string;
  estimated_end_date: string;
  estimated_sample_size: number;
  total_estimated_budget: number;
  budget_currency: string;
  estimated_spend_plus_1: number;
  estimated_spend_plus_2: number;
  estimated_spend_plus_3: number;
  pos: number;
  regions_accepting_submissions: string;
  pilot_research_question: string;
  pilot_potential_claims: string;
  pilot_primary_endpoints: string;
  pilot_secondary_endpoints: string;
  pilot_other_potential_endpoints: string;
  pilot_proposed_study_design: string;
  pilot_proposed_statistics: string;
  pilot_estimated_start_date: string;
  pilot_estimated_end_date: string;
  pilot_estimated_sample_size: number;
  pilot_total_estimated_budget: number;
  pilot_budget_currency: string;
  pilot_estimated_spend_plus_1: number;
  pilot_estimated_spend_plus_2: number;
  pilot_estimated_spend_plus_3: number;
  pilot_regions_accepting_submissions: string;
  created_by: number;
  comment: string;
}
