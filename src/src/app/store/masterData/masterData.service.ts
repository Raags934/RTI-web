import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MasterDataResponse } from '../../models/api-response/masterData.model';

interface ApiMasterDataResponse {
  data: MasterDataResponse;
  status: number;
}

@Injectable({ providedIn: 'root' })
export class MasterDataService {
  private baseUrl = 'http://localhost:5000/user_details';

  constructor(private http: HttpClient) {}

  getMasterDataByEmail(email: string): Observable<MasterDataResponse> {
    return this.http
      .get<ApiMasterDataResponse>(`${this.baseUrl}`, {
        params: { email }
      })
      .pipe(map((response) => response.data));
  }
}
