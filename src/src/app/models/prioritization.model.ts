export interface ProductRankingChange {
  idea_id: number;
  ranking_brand: string | null;
}

export interface TARankingChange {
  idea_id: number;
  ranking_franchise: string | null;
}

export interface PrioritizationPayload {
  ideas: ProductRankingChange[] | TARankingChange[];
  locked: boolean;
  updated_by: number;
}
