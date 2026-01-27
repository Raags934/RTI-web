import { User } from './user.model';

export interface AuditLog {
  audit_id: number;
  entity_id: number;
  action: string;
  change_description: string;
  changed_at: string;
  changed_by: User;
  changed_fields: Record<string, any>;
}

export interface AuditLogResponse {
  data: AuditLog[];
}
