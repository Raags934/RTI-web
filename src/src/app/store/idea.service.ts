import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { Idea, IdeaPayload, ExportIdeasPayload } from '../models/idea.model';
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
  // ----------------------------------------------------
  exportIdeas(payload: ExportIdeasPayload): Observable<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // 'x-api-key': this.x_api_key,
    });

    return this.http
      .post<any>(`${this.baseUrl}/export_idea`, payload, { headers })
      .pipe(
        map((res) => {
          // Handle response format: could be { body: "base64string" } or just "base64string"
          if (res && typeof res === 'object' && res.body) {
            return res.body;
          } else if (typeof res === 'string') {
            return res;
          } else {
            // If response is wrapped in quotes as JSON string, parse it
            return res;
          }
        })
      );
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
