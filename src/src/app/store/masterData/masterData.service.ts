import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MasterDataResponse } from '../../models/api-response/masterData.model';
import { environment } from '../../../environments/environment.development';
import { isLocalHost } from '../../core/utils/environment.util';

interface ApiMasterDataResponse {
  data: MasterDataResponse;
  status: number;
}

@Injectable({ providedIn: 'root' })
export class MasterDataService {
  /** On localhost use local API; otherwise use environment API URL. */
  private get baseUrl(): string {
    return isLocalHost() ? 'http://localhost:5000' : environment.apiUrl;
  }

  private get x_api_key(): string {
    return environment.x_api_key;
  }

  constructor(private http: HttpClient) {}

  getMasterDataByEmail(email: string): Observable<MasterDataResponse> {
    const headers = new HttpHeaders(
      isLocalHost()
        ? { 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json', 'x-api-key': this.x_api_key }
    );
    return this.http
      .get<ApiMasterDataResponse>(`${this.baseUrl}/user_details`, {
        headers,
        params: { email },
      })
      .pipe(map((response) => response.data));
  }
}
