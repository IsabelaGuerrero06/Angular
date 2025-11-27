import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Photo } from '../models/Photo';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  constructor(private http: HttpClient) { }

  list(): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${environment.url_backend}/photos`);
  }

  view(id: number): Observable<Blob> {
    return this.http.get(`${environment.url_backend}/photos/${id}`, {
      responseType: 'blob'
    });
  }

  getPhotoUrl(id: number): string {
    return `${environment.url_backend}/photos/${id}`;
  }

  create(newPhoto: Photo): Observable<Photo> {
    delete newPhoto.id;
    return this.http.post<Photo>(`${environment.url_backend}/photos`, newPhoto);
  }

  update(thePhoto: Photo): Observable<Photo> {
    return this.http.put<Photo>(`${environment.url_backend}/photos/${thePhoto.id}`, thePhoto);
  }

  delete(id: number): Observable<Photo> {
    return this.http.delete<Photo>(`${environment.url_backend}/photos/${id}`);
  }

  uploadPhoto(photoData: Partial<Photo>, file: File): Observable<Photo> {
    const formData = new FormData();
    
    // Agregar el archivo
    formData.append('file', file, file.name);
    
    // Agregar los demás campos
    if (photoData.issue_id) {
      formData.append('issue_id', photoData.issue_id.toString());
    }
    
    if (photoData.caption) {
      formData.append('caption', photoData.caption);
    }
    
    // Formatear la fecha correctamente
    if (photoData.taken_at) {
      const date = new Date(photoData.taken_at);
      formData.append('taken_at', date.toISOString());
    }

    // Usar la URL normal del backend
    // El interceptor NO agregará el token porque está en la lista de exclusión
    return this.http.post<Photo>(
      `${environment.url_backend}/photos/upload`,
      formData
    );
  }

  getImageUrl(filename: string): string {
    return `${environment.url_backend}/uploads/${filename}`;
  }
}