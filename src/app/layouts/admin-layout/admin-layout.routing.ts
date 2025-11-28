import { Routes } from '@angular/router';

import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { ChartsComponent } from 'src/app/pages/charts/charts.component';
import { OrdersMapComponent } from 'src/app/pages/orders-map/orders-map.component';
import { IconsComponent } from '../../pages/icons/icons.component';
import { MapsComponent } from '../../pages/maps/maps.component';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { TablesComponent } from '../../pages/tables/tables.component';
import { AuthenticationGuard } from 'src/app/guards/authentication.guard';

export const AdminLayoutRoutes: Routes = [
    { path: 'dashboard', component: DashboardComponent },
    { path: 'charts', component: ChartsComponent },
    { path: 'orders-map', component: OrdersMapComponent },
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
            },
            {
                path: 'issues',
                canActivate: [AuthenticationGuard],
                loadChildren: () => import('src/app/pages/issue/issue.module').then(m => m.IssueModule)
            },
            {
                path: 'addresses',
                canActivate: [AuthenticationGuard],
                loadChildren: () => import('src/app/pages/address/address.module').then(m => m.AddressModule)
            },
            {
                path: 'orders',
                canActivate: [AuthenticationGuard],
                loadChildren: () => import('src/app/pages/order/order.module').then(m => m.OrderModule)
            },
            {
                path: 'customers',
                canActivate: [AuthenticationGuard],
                loadChildren: () => import('src/app/pages/customer/customer.module').then(m => m.CustomerModule)
            },
            {
                path: 'drivers',
                canActivate: [AuthenticationGuard],
                loadChildren: () => import('src/app/pages/driver/driver.module').then(m => m.DriverModule)
            },
            {
                path: 'motorcycles',
                canActivate: [AuthenticationGuard],
                loadChildren: () => import('src/app/pages/motorcycle/motorcycle.module').then(m => m.MotorcycleModule)
            },
            {
                path: 'shifts',
                canActivate: [AuthenticationGuard],
                loadChildren: () => import('src/app/pages/shift/shift.module').then(m => m.ShiftModule)
            },
            {
                path: 'photos',
                canActivate: [AuthenticationGuard],
                loadChildren: () => import('src/app/pages/photo/photo.module').then(m => m.PhotoModule)
            }
        ]
    }
];
