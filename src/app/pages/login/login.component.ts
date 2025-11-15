import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/User';
import { SecurityService } from 'src/app/services/security.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  user: User;
  isLoading: boolean = false;

  constructor(
    private securityService: SecurityService,
    private router: Router
  ) {
    this.user = { email: "", password: "" };
  }

  /**
   * Login tradicional con email y password
   */
  login() {
    if (!this.user.email || !this.user.password) {
      Swal.fire("Campos vacíos", "Por favor ingresa email y contraseña", "warning");
      return;
    }

    this.isLoading = true;
    this.securityService.login(this.user).subscribe({
      next: (data) => {
        this.securityService.saveSession(data);
        this.router.navigate(["dashboard"]);
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        Swal.fire("Autenticación Inválida", "Usuario o contraseña inválido", "error");
      }
    });
  }

  /**
   * Login con Google
   */
  loginWithGoogle() {
    this.isLoading = true;
    
    this.securityService.loginWithGoogle().subscribe({
      next: async (credential) => {
        try {
          await this.securityService.processOAuthLogin(credential, 'google');
          
          Swal.fire({
            icon: 'success',
            title: '¡Bienvenido!',
            text: `Autenticado con Google: ${credential.user.email}`,
            timer: 2000,
            showConfirmButton: false
          });
          
          this.router.navigate(["dashboard"]);
        } catch (error) {
          console.error('Error procesando login de Google:', error);
          Swal.fire("Error", "Error al procesar la autenticación", "error");
        } finally {
          this.isLoading = false;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error en login con Google:', error);
        
        // Mensajes de error más específicos
        let errorMessage = "No se pudo iniciar sesión con Google";
        if (error.code === 'auth/popup-closed-by-user') {
          errorMessage = "Ventana de autenticación cerrada";
        } else if (error.code === 'auth/popup-blocked') {
          errorMessage = "Popup bloqueado por el navegador";
        }
        
        Swal.fire("Error", errorMessage, "error");
      }
    });
  }

  /**
   * Login con GitHub
   */
  loginWithGitHub() {
    this.isLoading = true;
    
    this.securityService.loginWithGitHub().subscribe({
      next: async (credential) => {
        try {
          await this.securityService.processOAuthLogin(credential, 'github');
          
          Swal.fire({
            icon: 'success',
            title: '¡Bienvenido!',
            text: `Autenticado con GitHub: ${credential.user.email}`,
            timer: 2000,
            showConfirmButton: false
          });
          
          this.router.navigate(["dashboard"]);
        } catch (error) {
          console.error('Error procesando login de GitHub:', error);
          Swal.fire("Error", "Error al procesar la autenticación", "error");
        } finally {
          this.isLoading = false;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error en login con GitHub:', error);
        
        let errorMessage = "No se pudo iniciar sesión con GitHub";
        if (error.code === 'auth/popup-closed-by-user') {
          errorMessage = "Ventana de autenticación cerrada";
        } else if (error.code === 'auth/popup-blocked') {
          errorMessage = "Popup bloqueado por el navegador";
        }
        
        Swal.fire("Error", errorMessage, "error");
      }
    });
  }

  /**
   * Login con Microsoft
   */
  loginWithMicrosoft() {
    this.isLoading = true;
    
    this.securityService.loginWithMicrosoft().subscribe({
      next: async (credential) => {
        try {
          await this.securityService.processOAuthLogin(credential, 'microsoft');
          
          Swal.fire({
            icon: 'success',
            title: '¡Bienvenido!',
            text: `Autenticado con Microsoft: ${credential.user.email}`,
            timer: 2000,
            showConfirmButton: false
          });
          
          this.router.navigate(["dashboard"]);
        } catch (error) {
          console.error('Error procesando login de Microsoft:', error);
          Swal.fire("Error", "Error al procesar la autenticación", "error");
        } finally {
          this.isLoading = false;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error en login con Microsoft:', error);
        
        let errorMessage = "No se pudo iniciar sesión con Microsoft";
        if (error.code === 'auth/popup-closed-by-user') {
          errorMessage = "Ventana de autenticación cerrada";
        } else if (error.code === 'auth/popup-blocked') {
          errorMessage = "Popup bloqueado por el navegador";
        }
        
        Swal.fire("Error", errorMessage, "error");
      }
    });
  }

  ngOnInit() {
    // Si ya hay sesión activa, redirigir al dashboard
    if (this.securityService.existSession()) {
      this.router.navigate(["dashboard"]);
    }
  }

  ngOnDestroy() {
  }
}