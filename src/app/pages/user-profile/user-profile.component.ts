import { Component, OnInit } from '@angular/core';
import { SecurityService } from 'src/app/services/security.service';
import { User } from 'src/app/models/User';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  user: User;
  userPhotoURL: string = 'assets/img/theme/team-4-800x800.jpg';
  subscription: Subscription;

  constructor(private securityService: SecurityService) { }

  ngOnInit() {
    // Obtener información del usuario autenticado
    this.subscription = this.securityService.getUser().subscribe(data => {
      this.user = data;
      
      // Actualizar foto de perfil
      if (data && data.photoURL) {
        this.userPhotoURL = data.photoURL;
      } else {
        this.userPhotoURL = 'assets/img/theme/team-4-800x800.jpg';
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}