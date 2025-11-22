import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Driver } from 'src/app/models/Driver';
import { DriverService } from 'src/app/services/driver.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  mode: number; // 1: view, 2: create, 3: update
  driver: Driver;
  theFormGroup: FormGroup;
  trySend: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private driverService: DriverService,
    private router: Router,
    private theFormBuilder: FormBuilder
  ) {
    this.trySend = false;
    this.driver = { id: 0 };
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
      this.driver.id = this.activatedRoute.snapshot.params.id;
      this.getDriver(this.driver.id);
    }
  }

  configFormGroup() {
    this.theFormGroup = this.theFormBuilder.group({
      id: [0, []],
      name: ['', [Validators.required, Validators.minLength(3)]],
      license_number: ['', [Validators.required, Validators.minLength(5)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      status: ['available', [Validators.required]]
    });
  }

  get getTheFormGroup() {
    return this.theFormGroup.controls;
  }

  getDriver(id: number) {
    this.driverService.view(id).subscribe({
      next: (response) => {
        this.driver = response;

        this.theFormGroup.patchValue({
          id: this.driver.id,
          name: this.driver.name,
          license_number: this.driver.license_number,
          phone: this.driver.phone,
          email: this.driver.email,
          status: this.driver.status
        });

        // Si está en modo view, deshabilitar todos los campos
        if (this.mode === 1) {
          this.theFormGroup.disable();
        }

        console.log('Driver fetched successfully:', this.driver);
      },
      error: (error) => {
        console.error('Error fetching driver:', error);
        Swal.fire('Error', 'Could not load driver details', 'error');
      }
    });
  }

  back() {
    this.router.navigate(['/drivers/list']);
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

    this.driverService.create(this.theFormGroup.value).subscribe({
      next: (driver) => {
        console.log('Driver created successfully:', driver);
        Swal.fire({
          title: 'Created!',
          text: 'Driver created successfully.',
          icon: 'success',
        });
        this.router.navigate(['/drivers/list']);
      },
      error: (error) => {
        console.error('Error creating driver:', error);
        Swal.fire('Error', 'Could not create driver', 'error');
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

    this.driverService.update(this.theFormGroup.value).subscribe({
      next: (driver) => {
        console.log('Driver updated successfully:', driver);
        Swal.fire({
          title: 'Updated!',
          text: 'Driver updated successfully.',
          icon: 'success',
        });
        this.router.navigate(['/drivers/list']);
      },
      error: (error) => {
        console.error('Error updating driver:', error);
        Swal.fire('Error', 'Could not update driver', 'error');
      }
    });
  }
}