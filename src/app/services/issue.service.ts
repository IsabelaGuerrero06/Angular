import { Injectable } from '@angular/core';
import { Issue } from '../models/Issue';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IssueService {

  constructor(private http: HttpClient) { }
  list(): Observable<Issue[]> {
    return this.http.get<Issue[]>(`${environment.url_backend}/issues`);
  }
  view(id: number): Observable<Issue> {
    return this.http.get<Issue>(`${environment.url_backend}/issues/${id}`);
  }
  create(newIssue: Issue): Observable<Issue> {
    delete newIssue.id;
    return this.http.post<Issue>(`${environment.url_backend}/issues`, newIssue);
  }
  update(theIssue: Issue): Observable<Issue> {
    return this.http.put<Issue>(`${environment.url_backend}/issues/${theIssue.id}`, theIssue);
  }

  delete(id: number) {
    return this.http.delete<Issue>(`${environment.url_backend}/issues/${id}`);
  }
}