import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Menu } from 'src/app/models/Menu';
import { Product } from 'src/app/models/Product';
import { Restaurant } from 'src/app/models/Restaurant';
import { MenuService } from 'src/app/services/menu.service';
import { ProductService } from 'src/app/services/product.service';
import { RestaurantService } from 'src/app/services/restaurant.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  mode: number; // 1: view, 2: create, 3: update
  menu: Menu;
  theFormGroup: FormGroup;
  trySend: boolean;
  
  // Listas para los selects
  restaurants: Restaurant[] = [];
  products: Product[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private menuService: MenuService,
    private restaurantService: RestaurantService,
    private productService: ProductService,
    private router: Router,
    private theFormBuilder: FormBuilder
  ) {
    this.trySend = false;
    this.menu = { id: 0 };
    this.configFormGroup();
  }

  ngOnInit(): void {
    // Determinar el modo (view, create, update)
    const currentUrl = this.activatedRoute.snapshot.url.join('/');
    if (currentUrl.includes('view')) {
      this.mode = 1;
    } else if (currentUrl.includes('create')) {
      this.mode = 2;
    } else if (currentUrl.includes('update')) {
      this.mode = 3;
    }

    // Cargar listas de restaurants y products
    this.loadRestaurants();
    this.loadProducts();

    // Si hay ID, cargar el menu
    if (this.activatedRoute.snapshot.params.id) {
      this.menu.id = this.activatedRoute.snapshot.params.id;
      this.getMenu(this.menu.id);
    }
  }

  configFormGroup() {
    this.theFormGroup = this.theFormBuilder.group({
      id: [0, []],
      restaurant_id: ['', [Validators.required]],
      product_id: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0), Validators.max(100000000)]],
      availability: [true, []]
    });
  }

  get getTheFormGroup() {
    return this.theFormGroup.controls;
  }

  // Cargar lista de restaurantes desde el backend
  loadRestaurants() {
    this.restaurantService.list().subscribe({
      next: (data) => {
        this.restaurants = data;
        console.log('Restaurants loaded:', this.restaurants);
      },
      error: (error) => {
        console.error('Error loading restaurants:', error);
        Swal.fire('Error', 'Could not load restaurants', 'error');
      }
    });
  }

  // Cargar lista de productos desde el backend
  loadProducts() {
    this.productService.list().subscribe({
      next: (data) => {
        this.products = data;
        console.log('Products loaded:', this.products);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        Swal.fire('Error', 'Could not load products', 'error');
      }
    });
  }

  // Obtener menu por ID
  getMenu(id: number) {
    this.menuService.view(id).subscribe({
      next: (response) => {
        this.menu = response;

        this.theFormGroup.patchValue({
          id: this.menu.id,
          restaurant_id: this.menu.restaurant_id,
          product_id: this.menu.product_id,
          price: this.menu.price,
          availability: this.menu.availability
        });

        // Si está en modo view, deshabilitar todos los campos
        if (this.mode === 1) {
          this.theFormGroup.disable();
        }

        console.log('Menu fetched successfully:', this.menu);
      },
      error: (error) => {
        console.error('Error fetching menu:', error);
        Swal.fire('Error', 'Could not load menu details', 'error');
      }
    });
  }

  back() {
    this.router.navigate(['/menus/list']);
  }

  create() {
    this.trySend = true;
    if (this.theFormGroup.invalid) {
      Swal.fire({
        title: 'Error!',
        text: 'Please complete all required fields.',
        icon: 'error',
      });
      return;
    }

    this.menuService.create(this.theFormGroup.value).subscribe({
      next: (menu) => {
        console.log('Menu created successfully:', menu);
        Swal.fire({
          title: 'Created!',
          text: 'Menu created successfully.',
          icon: 'success',
        });
        this.router.navigate(['/menus/list']);
      },
      error: (error) => {
        console.error('Error creating menu:', error);
        Swal.fire('Error', 'Could not create menu', 'error');
      }
    });
  }

  update() {
    this.trySend = true;
    if (this.theFormGroup.invalid) {
      Swal.fire({
        title: 'Error!',
        text: 'Please complete all required fields.',
        icon: 'error',
      });
      return;
    }

    this.menuService.update(this.theFormGroup.value).subscribe({
      next: (menu) => {
        console.log('Menu updated successfully:', menu);
        Swal.fire({
          title: 'Updated!',
          text: 'Menu updated successfully.',
          icon: 'success',
        });
        this.router.navigate(['/menus/list']);
      },
      error: (error) => {
        console.error('Error updating menu:', error);
        Swal.fire('Error', 'Could not update menu', 'error');
      }
    });
  }
}