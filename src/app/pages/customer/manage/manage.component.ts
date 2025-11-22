import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer } from 'src/app/models/Customer';
import { CustomerService } from 'src/app/services/customer.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  mode: number; // 1: view, 2: create, 3: update
  customer: Customer;
  theFormGroup: FormGroup;
  trySend: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private customerService: CustomerService,
    private router: Router,
    private theFormBuilder: FormBuilder
  ) {
    this.trySend = false;
    this.customer = { id: 0 };
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

    if (this.activatedRoute.snapshot.params.id) {
      this.customer.id = this.activatedRoute.snapshot.params.id;
      this.getCustomer(this.customer.id);
    }
  }

  configFormGroup() {
    this.theFormGroup = this.theFormBuilder.group({
      id: [0, []],
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(7)]]
    });
  }

  get getTheFormGroup() {
    return this.theFormGroup.controls;
  }

  getCustomer(id: number) {
    this.customerService.view(id).subscribe({
      next: (response) => {
        this.customer = response;

        this.theFormGroup.patchValue({
          id: this.customer.id,
          name: this.customer.name,
          email: this.customer.email,
          phone: this.customer.phone
        });

        // Si está en modo view, deshabilitar todos los campos
        if (this.mode === 1) {
          this.theFormGroup.disable();
        }

        console.log('Customer fetched successfully:', this.customer);
      },
      error: (error) => {
        console.error('Error fetching customer:', error);
        Swal.fire('Error', 'Could not load customer details', 'error');
      }
    });
  }

  back() {
    this.router.navigate(['/customers/list']);
  }

  create() {
    this.trySend = true;
    if (this.theFormGroup.invalid) {
      Swal.fire({
        title: 'Error!',
        text: 'Please complete all required fields correctly.',
        icon: 'error',
      });
      return;
    }

    this.customerService.create(this.theFormGroup.value).subscribe({
      next: (customer) => {
        console.log('Customer created successfully:', customer);
        Swal.fire({
          title: 'Created!',
          text: 'Customer created successfully.',
          icon: 'success',
        });
        this.router.navigate(['/customers/list']);
      },
      error: (error) => {
        console.error('Error creating customer:', error);
        Swal.fire('Error', 'Could not create customer', 'error');
      }
    });
  }

  update() {
    this.trySend = true;
    if (this.theFormGroup.invalid) {
      Swal.fire({
        title: 'Error!',
        text: 'Please complete all required fields correctly.',
        icon: 'error',
      });
      return;
    }

    this.customerService.update(this.theFormGroup.value).subscribe({
      next: (customer) => {
        console.log('Customer updated successfully:', customer);
        Swal.fire({
          title: 'Updated!',
          text: 'Customer updated successfully.',
          icon: 'success',
        });
        this.router.navigate(['/customers/list']);
      },
      error: (error) => {
        console.error('Error updating customer:', error);
        Swal.fire('Error', 'Could not update customer', 'error');
      }
    });
  }
}