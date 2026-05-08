import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CreateOrderRequest, Order, UpdateStatusRequest } from '../models/order.models';

@Injectable({ providedIn: 'root' })
export class OrderApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.orderApiUrl;

  listAll(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.base}/orders`);
  }

  myOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.base}/orders/my-orders`);
  }

  create(payload: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${this.base}/orders`, payload);
  }

  updateStatus(id: number, payload: UpdateStatusRequest): Observable<Order> {
    return this.http.put<Order>(`${this.base}/orders/${id}/status`, payload);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/orders/${id}`);
  }
}
