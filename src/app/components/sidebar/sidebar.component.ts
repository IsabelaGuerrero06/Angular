import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/User';
import { SecurityService } from 'src/app/services/security.service';

declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}
export const ROUTES: RouteInfo[] = [
    { path: '/dashboard', title: 'Dashboard',  icon: 'ni-tv-2 text-primary', class: '' },
    { path: '/charts', title: 'Gráficos',  icon: 'ni-chart-bar-32 text-success', class: '' },
    { path: '/orders-map', title: 'Mapa Pedidos',  icon: 'ni-pin-3 text-orange', class: '' },
    { path: '/products/list', title: 'Products', icon: 'ni-box-2 text-red', class: '' },
    { path: '/menus/list', title: 'Menus', icon: 'ni-book-bookmark text-purple', class: '' },
    { path: '/restaurants/list', title: 'Restaurants', icon: 'ni-shop text-default', class: '' },
    { path: '/issues/list', title: 'Issues', icon: 'ni-bell-55 text-warning', class: '' },
    { path: '/addresses/list', title: 'Addresses', icon: 'ni-pin-3 text-orange', class: '' },
    { path: '/orders/list', title: 'Orders', icon: 'ni-cart text-info', class: '' },
    { path: '/customers/list', title: 'Customers', icon: 'ni-single-02 text-yellow', class: '' },
    { path: '/drivers/list', title: 'Drivers', icon: 'ni-badge text-teal', class: '' },
    { path: '/photos/list', title: 'Photos', icon: 'ni-image text-pink', class: '' },
    { path: '/motorcycles/list', title: 'Motorcycles', icon: 'ni-delivery-fast text-danger', class: '' },
    { path: '/shifts/list', title: 'Shifts', icon: 'ni-time-alarm text-cyan', class: '' }
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  public menuItems: any[];
  public isCollapsed = true;
  user: User;
  subscription:Subscription;

  constructor(private router: Router,
  public securityService:SecurityService) {

      this.subscription = this.securityService.getUser().subscribe(data => {
      this.user = data;
    })
   }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
    this.router.events.subscribe((event) => {
      this.isCollapsed = true;
   });
  }
}