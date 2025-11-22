import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Shift } from '../models/Shift';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShiftService {

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los turnos
   */
  list(): Observable<Shift[]> {
    return this.http.get<Shift[]>(`${environment.url_backend}/shifts`).pipe(
      map(shifts => shifts.map(shift => this.parseDates(shift)))
    );
  }

  /**
   * Obtiene un turno específico por ID
   */
  view(id: number): Observable<Shift> {
    return this.http.get<Shift>(`${environment.url_backend}/shifts/${id}`).pipe(
      map(shift => this.parseDates(shift))
    );
  }

  /**
   * Crea un nuevo turno
   */
  create(newShift: Shift): Observable<Shift> {
    delete newShift.id;
    const payload = this.formatDates(newShift);
    return this.http.post<Shift>(`${environment.url_backend}/shifts`, payload).pipe(
      map(shift => this.parseDates(shift))
    );
  }

  /**
   * Actualiza un turno existente
   */
  update(theShift: Shift): Observable<Shift> {
    const payload = this.formatDates(theShift);
    return this.http.put<Shift>(`${environment.url_backend}/shifts/${theShift.id}`, payload).pipe(
      map(shift => this.parseDates(shift))
    );
  }

  /**
   * Elimina un turno por ID
   */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.url_backend}/shifts/${id}`);
  }

  /**
   * Finaliza un turno activo (marca end_time y cambia status)
   */
  endShift(id: number): Observable<Shift> {
  const now = new Date().toISOString();
  return this.http.put<Shift>(`${environment.url_backend}/shifts/${id}`, {
    end_time: now,
    status: 'completed'
  });
}

  /**
   * Obtiene turnos activos
   */
  getActiveShifts(): Observable<Shift[]> {
    return this.list().pipe(
      map(shifts => shifts.filter(shift => shift.status === 'active'))
    );
  }

  /**
   * Obtiene turnos por conductor
   */
  getByDriver(driverId: number): Observable<Shift[]> {
    return this.list().pipe(
      map(shifts => shifts.filter(shift => shift.driver_id === driverId))
    );
  }

  /**
   * Obtiene turnos por motocicleta
   */
  getByMotorcycle(motorcycleId: number): Observable<Shift[]> {
    return this.list().pipe(
      map(shifts => shifts.filter(shift => shift.motorcycle_id === motorcycleId))
    );
  }

  // ============ MÉTODOS AUXILIARES ============

  /**
   * Convierte las fechas de string a objetos Date
   */
  private parseDates(shift: any): Shift {
    return {
      ...shift,
      start_time: shift.start_time ? new Date(shift.start_time) : undefined,
      end_time: shift.end_time ? new Date(shift.end_time) : undefined
    };
  }

  /**
   * Formatea las fechas a ISO string para enviar al backend
   */
  private formatDates(shift: Shift): any {
    const payload: any = { ...shift };
    
    if (shift.start_time instanceof Date) {
      payload.start_time = shift.start_time.toISOString();
    }
    
    if (shift.end_time instanceof Date) {
      payload.end_time = shift.end_time.toISOString();
    } else if (shift.end_time === null) {
      payload.end_time = null;
    }
    
    return payload;
  }

  
}