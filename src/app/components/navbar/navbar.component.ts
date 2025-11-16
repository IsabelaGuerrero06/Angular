import { Component, OnInit, ElementRef } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { User } from 'src/app/models/User';
import { Subscription } from 'rxjs';
import { SecurityService } from 'src/app/services/security.service';
import { WebSocketService } from 'src/app/services/web-socket-service.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  public focus;
  public listTitles: any[];
  public location: Location;
  user: User;
  subscription: Subscription;
  userPhotoURL: string = 'assets/img/theme/team-4-800x800.jpg'; // Foto por defecto

  constructor(
    location: Location,
    private element: ElementRef,
    private router: Router,
    private securityService: SecurityService,
    private webSocketService: WebSocketService
  ) {
    this.location = location;

    // Obtener información del usuario
    this.subscription = this.securityService.getUser().subscribe(data => {
      this.user = data;
      
      console.log('Usuario en navbar:', data); // 🔍 DEBUG
      console.log('PhotoURL:', data?.photoURL); // 🔍 DEBUG
      
      // Actualizar foto de perfil (OAuth o default)
      if (data && data.photoURL) {
        this.userPhotoURL = data.photoURL;
        console.log('Foto actualizada a:', this.userPhotoURL); // 🔍 DEBUG
      } else {
        this.userPhotoURL = 'assets/img/theme/team-4-800x800.jpg';
        console.log('Usando foto por defecto'); // 🔍 DEBUG
      }
    });

    // Configurar WebSocket
    this.webSocketService.setNameEvent("ABC123");
    this.webSocketService.callback.subscribe((message) => {
      console.log("Mensaje recibido en el navbar: ", message);
    });
  }

  ngOnInit() {
    this.listTitles = ROUTES.filter(listTitle => listTitle);
    
    // Forzar actualización de foto al cargar el componente
    const currentUser = this.securityService.activeUserSession;
    if (currentUser && currentUser.photoURL) {
      this.userPhotoURL = currentUser.photoURL;
    }
  }

  getTitle() {
    var titlee = this.location.prepareExternalUrl(this.location.path());
    if (titlee.charAt(0) === '#') {
      titlee = titlee.slice(1);
    }

    for (var item = 0; item < this.listTitles.length; item++) {
      if (this.listTitles[item].path === titlee) {
        return this.listTitles[item].title;
      }
    }
    return 'Dashboard';
  }

  logout() {
    // Llamar al servicio de cierre de sesión
    this.securityService.logout();

    // Cerrar WebSocket si existe
    this.webSocketService.disconnect();

    // Redirigir al login
    this.router.navigate(['/login']);
  }
}