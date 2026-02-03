import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../../../models/user.model';

/** API response for user_details (single user by email) - matches Postman screenshot. */
export interface UserDetailsApiResponse {
  data: {
    user: User;
    dropdowns?: unknown;
    franchises?: unknown;
  };
  status: number;
}

/** API response for get_all_userdetails - data.users is the array of users. */
export interface GetAllUserDetailsApiResponse {
  data: { users: User[] };
  status: number;
}

/** Function item from GET /functions - display function_name (or function_type) in dropdown. */
export interface FunctionItem {
  function_id: number;
  function_name: string;
  function_type: string;
  description?: string;
  flag_soft_lock?: boolean;
}

/** Therapeutic area item from GET /therapeutic_areas - display ta_name in dropdown. */
export interface TherapeuticAreaItem {
  ta_id: number;
  ta_name: string;
  flag_soft_lock?: boolean;
  franchise_id?: number;
  franchise?: { franchise_id: number; franchise_name: string; franchise_code?: string };
}

export interface FunctionsApiResponse {
  data: FunctionItem[];
  status: number;
}

export interface TherapeuticAreasApiResponse {
  data: TherapeuticAreaItem[];
  status: number;
}

/** Payload for POST /functions/members - add or edit user assignments. */
export interface FunctionsMembersPayload {
  /** For edit: send user_id. For add: omit and send username + emailid instead. */
  user_id?: number;
  username?: string;
  emailid?: string;
  /** For edit: admin can set user active/inactive. */
  active?: boolean;
  assigned_by: number;
  assign: {
    function_ids: number[];
    role_ids: number[];
    ta_ids: number[];
  };
  unassign: {
    function_ids: number[];
    role_ids: number[];
    ta_ids: number[];
  };
}

@Injectable({ providedIn: 'root' })
export class ManageUserService {
  private baseUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  /**
   * GET user by email - same as Postman: GET /user_details?email=...
   * Response has data.user with name, email, active, functions, roles, therapeutic_areas, etc.
   */
  getUserByEmail(email: string): Observable<User> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http
      .get<UserDetailsApiResponse>(`${this.baseUrl}/user_details`, {
        headers,
        params: { email },
      })
      .pipe(map((res) => res.data.user));
  }

  /**
   * GET all user details for Manage Users page.
   * GET /get_all_userdetails - no payload required. Response: data.users (array of User with name, email, active, functions, roles, therapeutic_areas, user_id, etc.)
   */
  getUsers(): Observable<User[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http
      .get<GetAllUserDetailsApiResponse>(`${this.baseUrl}/get_all_userdetails`, {
        headers,
      })
      .pipe(map((res) => res.data?.users ?? []));
  }

  /**
   * GET all functions for Add User dropdown.
   * GET /functions - no params. Response: data[] with function_id, function_name, function_type. Display function_name in dropdown.
   */
  getFunctions(): Observable<FunctionItem[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http
      .get<FunctionsApiResponse>(`${this.baseUrl}/functions`, { headers })
      .pipe(map((res) => res.data ?? []));
  }

  /**
   * GET all therapeutic areas for Add User dropdown.
   * GET /therapeutic_areas - no params. Response: data[] with ta_id, ta_name, franchise. Display ta_name in dropdown.
   */
  getTherapeuticAreas(): Observable<TherapeuticAreaItem[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http
      .get<TherapeuticAreasApiResponse>(`${this.baseUrl}/therapeutic_areas`, {
        headers,
      })
      .pipe(map((res) => res.data ?? []));
  }

  /**
   * POST /functions/members - add or edit user (assign/unassign functions, roles, therapeutic areas).
   * Add user: send username, emailid, assigned_by, assign, unassign (no user_id).
   * Edit user: send user_id, assigned_by, assign, unassign (no username/emailid).
   */
  updateMembers(payload: FunctionsMembersPayload): Observable<unknown> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<unknown>(`${this.baseUrl}/functions/members`, payload, { headers });
  }
}
