import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Order } from 'src/app/models/Order';
import { Customer } from 'src/app/models/Customer';
import { Menu } from 'src/app/models/Menu';
import { Motorcycle } from 'src/app/models/Motorcycle';
import { OrderService } from 'src/app/services/order.service';
import { CustomerService } from 'src/app/services/customer.service';
import { MenuService } from 'src/app/services/menu.service';
import { MotorcycleService } from 'src/app/services/motorcycle.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  mode: number; // 1: view, 2: create, 3: update
  order: Order;
  theFormGroup: FormGroup;
  trySend: boolean;

  // Listas para los selects
  customers: Customer[] = [];
  menus: Menu[] = [];
  motorcycles: Motorcycle[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private orderService: OrderService,
    private customerService: CustomerService,
    private menuService: MenuService,
    private motorcycleService: MotorcycleService,
    private router: Router,
    private theFormBuilder: FormBuilder
  ) {
    this.trySend = false;
    this.order = { id: 0 };
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

    // Cargar listas relacionadas
    this.loadCustomers();
    this.loadMenus();
    this.loadMotorcycles();

    if (this.activatedRoute.snapshot.params.id) {
      this.order.id = this.activatedRoute.snapshot.params.id;
      this.getOrder(this.order.id);
    }
  }

  configFormGroup() {
    this.theFormGroup = this.theFormBuilder.group({
      id: [0, []],
      customer_id: ['', [Validators.required]],
      menu_id: ['', [Validators.required]],
      motorcycle_id: ['', [Validators.required]],
      quantity: ['', [Validators.required, Validators.min(1)]],
      total_price: ['', [Validators.required, Validators.min(0)]],
      status: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  get getTheFormGroup() {
    return this.theFormGroup.controls;
  }

  loadCustomers() {
    this.customerService.list().subscribe({
      next: (data) => {
        this.customers = data;
        console.log('Customers loaded:', this.customers);
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        Swal.fire('Error', 'Could not load customers', 'error');
      }
    });
  }

  loadMenus() {
    this.menuService.list().subscribe({
      next: (data) => {
        this.menus = data;
        console.log('Menus loaded:', this.menus);
      },
      error: (error) => {
        console.error('Error loading menus:', error);
        Swal.fire('Error', 'Could not load menus', 'error');
      }
    });
  }

  loadMotorcycles() {
    this.motorcycleService.list().subscribe({
      next: (data) => {
        this.motorcycles = data;
        console.log('Motorcycles loaded:', this.motorcycles);
      },
      error: (error) => {
        console.error('Error loading motorcycles:', error);
        Swal.fire('Error', 'Could not load motorcycles', 'error');
      }
    });
  }

  getOrder(id: number) {
    this.orderService.view(id).subscribe({
      next: (response) => {
        this.order = response;

        this.theFormGroup.patchValue({
          id: this.order.id,
          customer_id: this.order.customer_id,
          menu_id: this.order.menu_id,
          motorcycle_id: this.order.motorcycle_id,
          quantity: this.order.quantity,
          total_price: this.order.total_price,
          status: this.order.status
        });

        // Si está en modo view, deshabilitar todos los campos
        if (this.mode === 1) {
          this.theFormGroup.disable();
        }

        console.log('Order fetched successfully:', this.order);
      },
      error: (error) => {
        console.error('Error fetching order:', error);
        Swal.fire('Error', 'Could not load order details', 'error');
      }
    });
  }

  back() {
    this.router.navigate(['/orders/list']);
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

    this.orderService.create(this.theFormGroup.value).subscribe({
      next: (order) => {
        console.log('Order created successfully:', order);
        Swal.fire({
          title: 'Created!',
          text: 'Order created successfully.',
          icon: 'success',
        });
        this.router.navigate(['/orders/list']);
      },
      error: (error) => {
        console.error('Error creating order:', error);
        Swal.fire('Error', 'Could not create order', 'error');
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

    this.orderService.update(this.theFormGroup.value).subscribe({
      next: (order) => {
        console.log('Order updated successfully:', order);
        Swal.fire({
          title: 'Updated!',
          text: 'Order updated successfully.',
          icon: 'success',
        });
        this.router.navigate(['/orders/list']);
      },
      error: (error) => {
        console.error('Error updating order:', error);
        Swal.fire('Error', 'Could not update order', 'error');
      }
    });
  }
}