import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MasterDataResponse } from '../../models/api-response/masterData.model';
import { environment } from '../../../environments/environment.development';

interface ApiMasterDataResponse {
  data: MasterDataResponse;
  status: number;
}

@Injectable({ providedIn: 'root' })
export class MasterDataService {
  // private baseUrl = 'http://localhost:5000/user_details';
  private baseUrl = environment.apiUrl;
  private x_api_key = environment.x_api_key;
  //private okta_api_key = environment.okta_api_key;

  constructor(private http: HttpClient) {}

  getMasterDataByEmail(email: string): Observable<MasterDataResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
       'x-api-key': this.x_api_key,
      //'x-api-key': this.okta_api_key,
    });
    return this.http
      .get<ApiMasterDataResponse>(`${this.baseUrl}/user_details`, {
        headers,
        params: { email }
      })
      .pipe(map((response) => response.data));
  }
}
