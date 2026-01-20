import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { MasterDataResponse } from '../../models/api-response/masterData.model';
import masterData from './masterData.json';

@Injectable({ providedIn: 'root' })
export class MasterDataService {
  private baseUrl = '/api/master-data';

  constructor(private http: HttpClient) {}

  getMasterDataByEmail(email: string): Observable<MasterDataResponse> {
    return of(masterData as MasterDataResponse);
    //return this.http.get<MasterDataResponse>(`${this.baseUrl}?email=${email}`);
  }
}
