export interface StatusTab {
  label: string;
  status_id?: number;
  count?: number;
}

export const creator: StatusTab[] = [
  { label: 'All', status_id: 0 },
  { label: 'Draft', status_id: 1 },
  { label: 'Submitted', status_id: 5 },
  { label: 'Approved', status_id: 18 }
  ].map((item) => ({ ...item, count: 0 }));
 
  export const assessor: StatusTab[] = [
    { label: 'All', status_id: 0 },
    { label: 'Assessment Pending', status_id: 6 },
    { label: 'Assessed', status_id: 7 }
  ].map((item) => ({ ...item, count: 0 }));
 
  export const harmonizer: StatusTab[] = [
    { label: 'All', status_id: 0 },
    { label: 'Harmonization Pending', status_id: 18 }, // Submitted ideas – status column shows "Harmonization pending"
    { label: 'Harmonized', status_id: 10 }
  ].map((item) => ({ ...item, count: 0 }));


export const funding: StatusTab[] = [
    { label: 'All', status_id: 0 },
    { label: 'Funding Pending', status_id: 10 },
    { label: 'Funded', status_id: 1 },
    { label: 'Unfunded', status_id: 5 },
  ].map((item) => ({ ...item, count: 0 }));

 
 