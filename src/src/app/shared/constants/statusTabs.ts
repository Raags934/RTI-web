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

