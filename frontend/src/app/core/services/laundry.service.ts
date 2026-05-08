import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LaundryService, LaundryServiceRequest } from '../models/laundry.models';

@Injectable({ providedIn: 'root' })
export class LaundryApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.laundryApiUrl;

  list(onlyActive = false): Observable<LaundryService[]> {
    const url = onlyActive
      ? `${this.base}/services?onlyActive=true`
      : `${this.base}/services`;
    return this.http.get<LaundryService[]>(url);
  }

  get(id: number): Observable<LaundryService> {
    return this.http.get<LaundryService>(`${this.base}/services/${id}`);
  }

  create(payload: LaundryServiceRequest): Observable<LaundryService> {
    return this.http.post<LaundryService>(`${this.base}/services`, payload);
  }

  update(id: number, payload: LaundryServiceRequest): Observable<LaundryService> {
    return this.http.put<LaundryService>(`${this.base}/services/${id}`, payload);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/services/${id}`);
  }
}
