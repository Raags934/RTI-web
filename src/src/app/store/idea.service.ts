import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { Idea, IdeaPayload, ExportIdeasPayload, ResetIdeaPayload } from '../models/idea.model';
import { PrioritizationPayload } from '../models/prioritization.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { GetIdeasResponse } from '../models/api-response/get-ideas.model';
import { MasterDataResponse } from '../models/api-response/masterData.model';
import { AuditLog, AuditLogResponse } from '../models/audit-log.model';

@Injectable({
  providedIn: 'root',
})
export class IdeaService {
  // private baseUrl = environment.apiUrl;
  private baseUrl = 'http://localhost:5000';

  private x_api_key = environment.x_api_key;

  constructor(private http: HttpClient) {}

  // ----------------------------------------------------
  // GET: Load ideas
  // ----------------------------------------------------
  loadIdeas(): Observable<Idea[]> {
    const userEmail = 'karthik@example.com';

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // 'x-api-key': this.x_api_key,
    });

    return this.http
      .get<GetIdeasResponse<Idea[]>>(`${this.baseUrl}/ideas`, {
        headers,
        params: { email: userEmail },
      })
      .pipe(map((res) => res.data));
  }

  // loadIdeas(): Observable<Idea[]> {
  //   return of(ideaData as Idea[]);
  // }

  // ----------------------------------------------------
  // POST: Create new idea
  // ----------------------------------------------------

  addIdea(payload: IdeaPayload): Observable<Idea> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // 'x-api-key': this.x_api_key,
    });

    return this.http
      .post<GetIdeasResponse<Idea>>(`${this.baseUrl}/ideas`, payload, { headers })
      .pipe(map((res) => res.data));
  }


 addDraftIdea(payload: IdeaPayload): Observable<Idea> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // 'x-api-key': this.x_api_key,
    });

    return this.http
      .post<GetIdeasResponse<Idea>>(`${this.baseUrl}/ideas/draft`, payload, { headers })
      .pipe(map((res) => res.data));
  }

  // ----------------------------------------------------
  // PUT: Update existing idea
  // ----------------------------------------------------
  updateIdea(ideaId: number, payload: IdeaPayload): Observable<{ idea_id: number; message: string; status: number }> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // 'x-api-key': this.x_api_key,
    });

    return this.http
      .put<{ idea_id: number; message: string; status: number }>(`${this.baseUrl}/ideas/${ideaId}`, payload, { headers });
  }



  // ----------------------------------------------------
  // PUT: Save/Submit prioritization
  // ----------------------------------------------------
  addPrioritization(payload: PrioritizationPayload, url: string): Observable<Idea> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // 'x-api-key': this.x_api_key,
    });

    return this.http
      .put<GetIdeasResponse<Idea>>(`${this.baseUrl}/${url}`, payload, { headers })
      .pipe(map((res) => res.data));
  }

  // ----------------------------------------------------
  // POST: Export ideas to XLSX
  // API may return raw binary (YML) or base64 / JSON-wrapped base64 (backend).
  // We support both: blob → use as-is; text → parse base64, decode → Excel Blob.
  // ----------------------------------------------------
  exportIdeas(payload: ExportIdeasPayload): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // 'x-api-key': this.x_api_key,
    });

    return this.http
      .post(`${this.baseUrl}/export_idea`, payload, {
        headers,
        responseType: 'text',
      })
      .pipe(
        map((res: string) => {
          if (!res || res.trim().length === 0) {
            throw new Error('Empty response from export endpoint');
          }
          const raw = res.trim();

          // JSON error response (e.g. { status: 400/500, message: "..." })
          if (raw.startsWith('{')) {
            try {
              const parsed = JSON.parse(raw) as Record<string, unknown>;
              if (
                typeof parsed['status'] === 'number' &&
                (parsed['status'] as number) >= 400 &&
                typeof parsed['message'] === 'string'
              ) {
                throw new Error(
                  `Export failed: ${parsed['message']} (status ${parsed['status']})`
                );
              }
              // JSON with base64 in body / data / content
              const base64 =
                (parsed['body'] as string) ??
                (parsed['data'] as string) ??
                (parsed['content'] as string);
              if (typeof base64 === 'string' && base64.length > 0) {
                return this.base64ToExcelBlob(base64);
              }
            } catch (e) {
              if (e instanceof Error && e.message.startsWith('Export failed:')) {
                throw e;
              }
              // Not error JSON; fall through to try as base64
            }
          }

          // Quoted JSON string (e.g. "UEsDBBQ...")
          if (raw.startsWith('"') && raw.endsWith('"')) {
            try {
              const decoded = JSON.parse(raw) as string;
              if (typeof decoded === 'string') {
                return this.base64ToExcelBlob(decoded);
              }
            } catch {
              // ignore
            }
          }

          // Plain base64 string
          return this.base64ToExcelBlob(raw);
        })
      ) as Observable<Blob>;
  }

  private base64ToExcelBlob(base64: string): Blob {
    const binary = atob(base64.replace(/\s/g, ''));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  // ----------------------------------------------------
  // PUT: Reset idea (path param: idea_id; body: comment optional, updated_by required)
  // ----------------------------------------------------
  resetIdea(ideaId: number, payload: ResetIdeaPayload): Observable<unknown> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.put<unknown>(`${this.baseUrl}/ideas/${ideaId}/reset`, payload, { headers });
  }

  // ----------------------------------------------------
  // DELETE: Delete idea
  // ----------------------------------------------------
  deleteIdea(ideaId: number): Observable<void> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // 'x-api-key': this.x_api_key,
    });

    return this.http.delete<void>(`${this.baseUrl}/ideas/${ideaId}`, { headers });
  }

  // ----------------------------------------------------
  // GET: Get audit logs for an idea
  // ----------------------------------------------------
  getAuditLogs(ideaId: number): Observable<AuditLog[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // 'x-api-key': this.x_api_key,
    });

    const url = `${this.baseUrl}/audit_logs/${ideaId}`;
    console.log('📡 Making API call to:', url);

    return this.http
      .get<AuditLogResponse | AuditLog[]>(url, { headers })
      .pipe(
        map((res) => {
          console.log('📦 Raw API response:', res);
          // Handle both response formats: { data: [...] } or [...]
          if (Array.isArray(res)) {
            return res;
          } else if (res && typeof res === 'object' && 'data' in res) {
            return res.data || [];
          }
          return [];
        })
      );
  }
}
