import { Routes } from '@angular/router';

import { LoginComponent } from '../../pages/login/login.component';
import { RegisterComponent } from '../../pages/register/register.component';
import { NoAuthenticationGuard } from 'src/app/guards/no-authentication.guard';

export const AuthLayoutRoutes: Routes = [
    { path: 'login',      canActivate: [NoAuthenticationGuard], component: LoginComponent },
    { path: 'register',   canActivate: [NoAuthenticationGuard], component: RegisterComponent }
];
