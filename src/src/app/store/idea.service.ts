import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { Idea, IdeaPayload } from '../models/idea.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { GetIdeasResponse } from '../models/api-response/get-ideas.model';
import { MasterDataResponse } from '../models/api-response/masterData.model';

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

  addPrioritization(payload: any, url: string): Observable<Idea> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // 'x-api-key': this.x_api_key,
    });

    return this.http
      .put<GetIdeasResponse<Idea>>(`${this.baseUrl}/${url}`, payload, { headers })
      .pipe(map((res) => res.data));
  }
}
