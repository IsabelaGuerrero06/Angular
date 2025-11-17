import { Injectable } from '@angular/core';
import { Motorcycle } from '../models/Motorcycle';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MotorcycleService {

  constructor(private http: HttpClient) { }
  list(): Observable<Motorcycle[]> {
    return this.http.get<Motorcycle[]>(`${environment.url_backend}/motorcycles`);
  }
  view(id: number): Observable<Motorcycle> {
    return this.http.get<Motorcycle>(`${environment.url_backend}/motorcycles/${id}`);
  }
  create(newMotorcycle: Motorcycle): Observable<Motorcycle> {
    delete newMotorcycle.id;
    return this.http.post<Motorcycle>(`${environment.url_backend}/motorcycles`, newMotorcycle);
  }
  update(theMotorcycle: Motorcycle): Observable<Motorcycle> {
    return this.http.put<Motorcycle>(`${environment.url_backend}/motorcycles/${theMotorcycle.id}`, theMotorcycle);
  }

  delete(id: number) {
    return this.http.delete<Motorcycle>(`${environment.url_backend}/motorcycles/${id}`);
  }
}