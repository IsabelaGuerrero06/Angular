import { Injectable } from '@angular/core';
import { Menu } from '../models/Menu';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(private http: HttpClient) { }
  list(): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${environment.url_backend}/menus`);
  }
  view(id: number): Observable<Menu> {
    return this.http.get<Menu>(`${environment.url_backend}/menus/${id}`);
  }
  create(newMenu: Menu): Observable<Menu> {
    delete newMenu.id;
    return this.http.post<Menu>(`${environment.url_backend}/menus`, newMenu);
  }
  update(theMenu: Menu): Observable<Menu> {
    return this.http.put<Menu>(`${environment.url_backend}/menus/${theMenu.id}`, theMenu);
  }

  delete(id: number) {
    return this.http.delete<Menu>(`${environment.url_backend}/menus/${id}`);
  }
}