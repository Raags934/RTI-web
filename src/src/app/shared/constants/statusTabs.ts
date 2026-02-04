export interface StatusTab {
  label: string;
  status_id?: number;
  count?: number;
}

export const creator: StatusTab[] = [
  { label: 'All', status_id: 0 },
  { label: 'Revision Required', status_id: 3 },
  { label: 'Draft', status_id: 1 },
  { label: 'Submitted', status_id: 5 },
 
].map((item) => ({ ...item, count: 0 }));

export const assessor: StatusTab[] = [
  { label: 'All', status_id: 0 },
  { label: 'Assessment Pending', status_id: 6 },
  { label: 'Assessed', status_id: 7 }
].map((item) => ({ ...item, count: 0 }));

export const harmonizer: StatusTab[] = [
  { label: 'All', status_id: 0 },
  { label: 'Harmonization Pending', status_id: 8 },
  // { label: 'Revision Required', status_id: 3 },
  { label: 'Study Draft', status_id: 9 },
  { label: 'Harmonized', status_id: 10 }
].map((item) => ({ ...item, count: 0 }));

