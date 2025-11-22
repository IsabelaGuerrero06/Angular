import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Driver } from '../models/Driver';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DriverService {

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los conductores
   */
  list(): Observable<Driver[]> {
    return this.http.get<Driver[]>(`${environment.url_backend}/drivers`);
  }

  /**
   * Obtiene un conductor específico por ID
   */
  view(id: number): Observable<Driver> {
    return this.http.get<Driver>(`${environment.url_backend}/drivers/${id}`);
  }

  /**
   * Crea un nuevo conductor
   */
  create(newDriver: Driver): Observable<Driver> {
    delete newDriver.id;
    return this.http.post<Driver>(`${environment.url_backend}/drivers`, newDriver);
  }

  /**
   * Actualiza un conductor existente
   */
  update(theDriver: Driver): Observable<Driver> {
    return this.http.put<Driver>(`${environment.url_backend}/drivers/${theDriver.id}`, theDriver);
  }

  /**
   * Elimina un conductor por ID
   */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.url_backend}/drivers/${id}`);
  }

  /**
   * Obtiene conductores filtrados por estado
   * @param status - Estado del conductor (ej: 'available', 'busy', 'offline')
   */
  getByStatus(status: string): Observable<Driver[]> {
    return this.http.get<Driver[]>(`${environment.url_backend}/drivers`, {
      params: { status }
    });
  }
}