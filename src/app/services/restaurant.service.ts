import { Injectable } from '@angular/core';
import { Restaurant } from '../models/Restaurant';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

  constructor(private http: HttpClient) { }
  list(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${environment.url_backend}/restaurants`);
  }
  view(id: number): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${environment.url_backend}/restaurants/${id}`);
  }
  create(newRestaurant: Restaurant): Observable<Restaurant> {
    delete newRestaurant.id;
    return this.http.post<Restaurant>(`${environment.url_backend}/restaurants`, newRestaurant);
  }
  update(theRestaurant: Restaurant): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${environment.url_backend}/restaurants/${theRestaurant.id}`, theRestaurant);
  }

  delete(id: number) {
    return this.http.delete<Restaurant>(`${environment.url_backend}/restaurants/${id}`);
  }
}