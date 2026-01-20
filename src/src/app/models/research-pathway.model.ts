export interface ResearchPathway {
    pathway_id: number;
    pathway_name: string;
    description: string | null;
    function_id: number;
    flag_soft_lock: boolean;
    created_at?: string;
  }
 