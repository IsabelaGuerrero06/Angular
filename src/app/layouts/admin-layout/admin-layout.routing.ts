import { Routes } from '@angular/router';

import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { IconsComponent } from '../../pages/icons/icons.component';
import { MapsComponent } from '../../pages/maps/maps.component';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { TablesComponent } from '../../pages/tables/tables.component';
import { AuthenticationGuard } from 'src/app/guards/authentication.guard';

export const AdminLayoutRoutes: Routes = [
    { path: 'dashboard', component: DashboardComponent },
    { path: 'user-profile', component: UserProfileComponent },
    { path: 'tables', component: TablesComponent },
    { path: 'icons', component: IconsComponent },
    { path: 'maps', component: MapsComponent },
    {
        path: '',
        children: [
            {
                path: 'theaters',
                canActivate: [AuthenticationGuard],
                loadChildren: () => import('src/app/pages/theaters/theaters.module').then(m => m.TheatersModule)
            },
            {
                path: 'products',
                canActivate: [AuthenticationGuard],
                loadChildren: () => import('src/app/pages/product/product.module').then(m => m.ProductModule)
            },
            {
                path: 'menus',
                canActivate: [AuthenticationGuard],
                loadChildren: () => import('src/app/pages/menu/menu.module').then(m => m.MenuModule)
            },
            {
                path: 'restaurants',
                canActivate: [AuthenticationGuard],
                loadChildren: () => import('src/app/pages/restaurant/restaurant.module').then(m => m.RestaurantModule)
            }
        ]
    }
];
