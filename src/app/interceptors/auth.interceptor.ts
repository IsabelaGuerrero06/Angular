import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { SecurityService } from '../services/security.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private securityService: SecurityService,
    private router: Router
  ) { }
    
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let theUser = this.securityService.activeUserSession;
    const token = theUser?.token;
    
    // Lista de URLs que NO deben ser interceptadas
    const excludedUrls = [
      '/login',
      '/token-validation',
      '/photos/upload',  // AGREGADO: No interceptar upload de fotos
      'generativelanguage.googleapis.com',
      'googleapis.com'
    ];
    
    // Verificar si la URL debe ser excluida
    const shouldExclude = excludedUrls.some(url => request.url.includes(url));
    
    if (shouldExclude) {
      console.log("✅ Petición excluida del interceptor:", request.url);
      return next.handle(request);
    }
    
    console.log("🔒 Interceptando petición:", request.url);
    console.log("🔑 Token presente:", !!token);
    
    // Si hay token, adjuntarlo a la solicitud
    if (token) {
      const authRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return next.handle(authRequest).pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('❌ Error HTTP interceptado:', err.status, err.message);
          
          if (err.status === 401) {
            // Error de autenticación
            if (request.url.includes(this.getBackendUrl())) {
              Swal.fire({
                title: 'Sesión expirada',
                text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
                icon: 'warning',
                timer: 3000,
                showConfirmButton: false
              });
              
              this.securityService.logout();
              this.router.navigateByUrl('/login');
            }
          } else if (err.status === 400) {
            if (request.url.includes(this.getBackendUrl())) {
              Swal.fire({
                title: 'Error en la solicitud',
                text: err.error?.message || 'Verifica los datos enviados',
                icon: 'error',
                timer: 3000
              });
            }
          } else if (err.status === 403) {
            Swal.fire({
              title: 'Acceso denegado',
              text: 'No tienes permisos para realizar esta acción',
              icon: 'error',
              timer: 3000
            });
          } else if (err.status === 500) {
            Swal.fire({
              title: 'Error del servidor',
              text: 'Ocurrió un error en el servidor. Intenta más tarde.',
              icon: 'error',
              timer: 3000
            });
          } else if (err.status === 0) {
            console.error('⚠️ Error de red o CORS detectado');
            Swal.fire({
              title: 'Error de conexión',
              text: 'No se pudo conectar con el servidor. Verifica tu conexión.',
              icon: 'error',
              timer: 4000
            });
          }

          return throwError(() => err);
        })
      );
    } else {
      console.log("⚠️ No hay token, continuando sin autenticación");
      return next.handle(request);
    }
  }

  private getBackendUrl(): string {
    return 'http://127.0.0.1:5000';
  }
}