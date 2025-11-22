import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/Order';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient) { }

  list(): Observable<Order[]> {
    return this.http.get<Order[]>(`${environment.url_backend}/orders`);
  }

  view(id: number): Observable<Order> {
    return this.http.get<Order>(`${environment.url_backend}/orders/${id}`);
  }

  create(newOrder: Order): Observable<Order> {
    delete newOrder.id;
    return this.http.post<Order>(`${environment.url_backend}/orders`, newOrder);
  }

  update(theOrder: Order): Observable<Order> {
    return this.http.put<Order>(`${environment.url_backend}/orders/${theOrder.id}`, theOrder);
  }

  delete(id: number): Observable<Order> {
    return this.http.delete<Order>(`${environment.url_backend}/orders/${id}`);
  }
}