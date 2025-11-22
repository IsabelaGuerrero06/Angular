import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Motorcycle } from 'src/app/models/Motorcycle';
import { MotorcycleService } from 'src/app/services/motorcycle.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  mode: number; // 1: view, 2: create, 3: update
  motorcycle: Motorcycle;
  theFormGroup: FormGroup;
  trySend: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private motorcycleService: MotorcycleService,
    private router: Router,
    private theFormBuilder: FormBuilder
  ) {
    this.trySend = false;
    this.motorcycle = { id: 0 };
    this.configFormGroup();
  }

  getMaxYear(): number {
    return new Date().getFullYear() + 1;
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
      this.motorcycle.id = this.activatedRoute.snapshot.params.id;
      this.getMotorcycle(this.motorcycle.id);
    }
  }

  configFormGroup() {
    this.theFormGroup = this.theFormBuilder.group({
      id: [0, []],
      license_plate: ['', [Validators.required, Validators.minLength(6)]],
      
      brand: ['', [Validators.required, Validators.minLength(2)]],
      year: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
      status: ['available', [Validators.required]]
    });
  }

  get getTheFormGroup() {
    return this.theFormGroup.controls;
  }

  getMotorcycle(id: number) {
    this.motorcycleService.view(id).subscribe({
      next: (response) => {
        this.motorcycle = response;

        this.theFormGroup.patchValue({
          id: this.motorcycle.id,
          license_plate: this.motorcycle.license_plate,
          brand: this.motorcycle.brand,
          year: this.motorcycle.year,
          status: this.motorcycle.status
        });

        // Si está en modo view, deshabilitar todos los campos
        if (this.mode === 1) {
          this.theFormGroup.disable();
        }

        console.log('Motorcycle fetched successfully:', this.motorcycle);
      },
      error: (error) => {
        console.error('Error fetching motorcycle:', error);
        Swal.fire('Error', 'Could not load motorcycle details', 'error');
      }
    });
  }

  back() {
    this.router.navigate(['/motorcycles/list']);
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

    this.motorcycleService.create(this.theFormGroup.value).subscribe({
      next: (motorcycle) => {
        console.log('Motorcycle created successfully:', motorcycle);
        Swal.fire({
          title: 'Created!',
          text: 'Motorcycle created successfully.',
          icon: 'success',
        });
        this.router.navigate(['/motorcycles/list']);
      },
      error: (error) => {
        console.error('Error creating motorcycle:', error);
        Swal.fire('Error', 'Could not create motorcycle', 'error');
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

    this.motorcycleService.update(this.theFormGroup.value).subscribe({
      next: (motorcycle) => {
        console.log('Motorcycle updated successfully:', motorcycle);
        Swal.fire({
          title: 'Updated!',
          text: 'Motorcycle updated successfully.',
          icon: 'success',
        });
        this.router.navigate(['/motorcycles/list']);
      },
      error: (error) => {
        console.error('Error updating motorcycle:', error);
        Swal.fire('Error', 'Could not update motorcycle', 'error');
      }
    });
  }
}