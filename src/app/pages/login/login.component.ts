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
  user: User
  constructor(private securityService: SecurityService,private router:Router) {
    this.user = { email: "", password: "" }
  }
  login() {
    this.securityService.login(this.user).subscribe({
      next: (data) => {
        this.securityService.saveSession(data)
        this.router.navigate(["dashboard"])
      },
      error: (error) => {
        Swal.fire("Autenticación Inválida", "Usuario o contraseña inválido", "error")
      }
    })
  }

  ngOnInit() {
  }
  ngOnDestroy() {
  }

} 