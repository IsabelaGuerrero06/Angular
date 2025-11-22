import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Address } from 'src/app/models/Address';
import { Order } from 'src/app/models/Order';
import { AddressService } from 'src/app/services/address.service';
import { OrderService } from 'src/app/services/order.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  mode: number; // 1: view, 2: create, 3: update
  address: Address;
  theFormGroup: FormGroup;
  trySend: boolean;

  // Lista de órdenes para el select
  orders: Order[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private addressService: AddressService,
    private orderService: OrderService,
    private router: Router,
    private theFormBuilder: FormBuilder
  ) {
    this.trySend = false;
    this.address = { id: 0 };
    this.configFormGroup();
  }

  ngOnInit(): void {
    // Determinar el modo (view, create, update)
    const currentUrl = this.activatedRoute.snapshot.url.join('/');
    if (currentUrl.includes('view')) {
      this.mode = 1;
    } else if (currentUrl.includes('create')) {
      this.mode = 2;
    } else if (currentUrl.includes('manage')) {
      // Si tiene ID es update, si no es create
      if (this.activatedRoute.snapshot.params.id) {
        this.mode = 3;
      } else {
        this.mode = 2;
      }
    }

    // Cargar lista de órdenes
    this.loadOrders();

    if (this.activatedRoute.snapshot.params.id) {
      this.address.id = this.activatedRoute.snapshot.params.id;
      this.getAddress(this.address.id);
    }
  }

  configFormGroup() {
    this.theFormGroup = this.theFormBuilder.group({
      id: [0, []],
      order_id: ['', [Validators.required]],
      street: ['', [Validators.required, Validators.minLength(3)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', [Validators.required, Validators.minLength(2)]],
      postal_code: ['', [Validators.required, Validators.minLength(3)]],
      additional_info: ['', []]
    });
  }

  get getTheFormGroup() {
    return this.theFormGroup.controls;
  }

  // Cargar lista de órdenes desde el backend
  loadOrders() {
    this.orderService.list().subscribe({
      next: (data) => {
        this.orders = data;
        console.log('Orders loaded:', this.orders);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        Swal.fire('Error', 'Could not load orders', 'error');
      }
    });
  }

  getAddress(id: number) {
    this.addressService.view(id).subscribe({
      next: (response) => {
        this.address = response;

        this.theFormGroup.patchValue({
          id: this.address.id,
          order_id: this.address.order_id,
          street: this.address.street,
          city: this.address.city,
          state: this.address.state,
          postal_code: this.address.postal_code,
          additional_info: this.address.additional_info
        });

        // Si está en modo view, deshabilitar todos los campos
        if (this.mode === 1) {
          this.theFormGroup.disable();
        }

        console.log('Address fetched successfully:', this.address);
      },
      error: (error) => {
        console.error('Error fetching address:', error);
        Swal.fire('Error', 'Could not load address details', 'error');
      }
    });
  }

  back() {
    this.router.navigate(['/addresses/list']);
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

    const addressData = this.theFormGroup.value;

    this.addressService.create(addressData).subscribe({
      next: (address) => {
        console.log('Address created successfully:', address);
        Swal.fire({
          title: 'Created!',
          text: 'Address created successfully.',
          icon: 'success',
        });
        this.router.navigate(['/addresses/list']);
      },
      error: (error) => {
        console.error('Error creating address:', error);
        Swal.fire('Error', 'Could not create address', 'error');
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

    const addressData = this.theFormGroup.value;

    this.addressService.update(addressData).subscribe({
      next: (address) => {
        console.log('Address updated successfully:', address);
        Swal.fire({
          title: 'Updated!',
          text: 'Address updated successfully.',
          icon: 'success',
        });
        this.router.navigate(['/addresses/list']);
      },
      error: (error) => {
        console.error('Error updating address:', error);
        Swal.fire('Error', 'Could not update address', 'error');
      }
    });
  }
}