import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Restaurant } from 'src/app/models/Restaurant';
import { RestaurantService } from 'src/app/services/restaurant.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  mode: number; // 1: view, 2: create, 3: update
  restaurant: Restaurant;
  theFormGroup: FormGroup;
  trySend: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private restaurantService: RestaurantService,
    private router: Router,
    private theFormBuilder: FormBuilder
  ) {
    this.trySend = false;
    this.restaurant = { id: 0 };
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
      this.restaurant.id = this.activatedRoute.snapshot.params.id;
      this.getRestaurant(this.restaurant.id);
    }
  }

  configFormGroup() {
    this.theFormGroup = this.theFormBuilder.group({
      id: [0, []],
      name: ['', [Validators.required, Validators.minLength(2)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      phone: ['', [Validators.required, Validators.minLength(7)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get getTheFormGroup() {
    return this.theFormGroup.controls;
  }

  getRestaurant(id: number) {
    this.restaurantService.view(id).subscribe({
      next: (response) => {
        this.restaurant = response;

        this.theFormGroup.patchValue({
          id: this.restaurant.id,
          name: this.restaurant.name,
          address: this.restaurant.address,
          phone: this.restaurant.phone,
          email: this.restaurant.email
        });

        // Si está en modo view, deshabilitar todos los campos
        if (this.mode === 1) {
          this.theFormGroup.disable();
        }

        console.log('Restaurant fetched successfully:', this.restaurant);
      },
      error: (error) => {
        console.error('Error fetching restaurant:', error);
        Swal.fire('Error', 'Could not load restaurant details', 'error');
      }
    });
  }

  back() {
    this.router.navigate(['/restaurants/list']);
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

    this.restaurantService.create(this.theFormGroup.value).subscribe({
      next: (restaurant) => {
        console.log('Restaurant created successfully:', restaurant);
        Swal.fire({
          title: 'Created!',
          text: 'Restaurant created successfully.',
          icon: 'success',
        });
        this.router.navigate(['/restaurants/list']);
      },
      error: (error) => {
        console.error('Error creating restaurant:', error);
        Swal.fire('Error', 'Could not create restaurant', 'error');
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

    this.restaurantService.update(this.theFormGroup.value).subscribe({
      next: (restaurant) => {
        console.log('Restaurant updated successfully:', restaurant);
        Swal.fire({
          title: 'Updated!',
          text: 'Restaurant updated successfully.',
          icon: 'success',
        });
        this.router.navigate(['/restaurants/list']);
      },
      error: (error) => {
        console.error('Error updating restaurant:', error);
        Swal.fire('Error', 'Could not update restaurant', 'error');
      }
    });
  }
}