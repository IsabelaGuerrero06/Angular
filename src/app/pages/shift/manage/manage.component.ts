import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Shift } from 'src/app/models/Shift';
import { Driver } from 'src/app/models/Driver';
import { Motorcycle } from 'src/app/models/Motorcycle';
import { ShiftService } from 'src/app/services/shift.service';
import { DriverService } from 'src/app/services/driver.service';
import { MotorcycleService } from 'src/app/services/motorcycle.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  mode: number; // 1: view, 2: create, 3: update
  shift: Shift;
  theFormGroup: FormGroup;
  trySend: boolean;

  // Listas para los selects
  drivers: Driver[] = [];
  motorcycles: Motorcycle[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private shiftService: ShiftService,
    private driverService: DriverService,
    private motorcycleService: MotorcycleService,
    private router: Router,
    private theFormBuilder: FormBuilder
  ) {
    this.trySend = false;
    this.shift = { id: 0 };
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

    // Cargar listas para los selects
    this.loadDrivers();
    this.loadMotorcycles();

    if (this.activatedRoute.snapshot.params.id) {
      this.shift.id = this.activatedRoute.snapshot.params.id;
      this.getShift(this.shift.id);
    }
  }

  configFormGroup() {
    this.theFormGroup = this.theFormBuilder.group({
      id: [0, []],
      driver_id: ['', [Validators.required]],
      motorcycle_id: ['', [Validators.required]],
      start_time: ['', [Validators.required]],
      end_time: ['', []],
      status: ['active', [Validators.required]]
    });
  }

  get getTheFormGroup() {
    return this.theFormGroup.controls;
  }

  // Cargar lista de conductores desde el backend
  loadDrivers() {
    this.driverService.list().subscribe({
      next: (data) => {
        this.drivers = data;
        console.log('Drivers loaded:', this.drivers);
      },
      error: (error) => {
        console.error('Error loading drivers:', error);
        Swal.fire('Error', 'Could not load drivers', 'error');
      }
    });
  }

  // Cargar lista de motocicletas desde el backend
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

  // Convertir fecha para el input datetime-local
  formatDateForInput(date: any): string {
    if (!date) return '';
    
    try {
      const d = new Date(date);
      // Formato: "2024-11-17T23:45"
      return d.toISOString().slice(0, 16);
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  getShift(id: number) {
    this.shiftService.view(id).subscribe({
      next: (response) => {
        this.shift = response;

        this.theFormGroup.patchValue({
          id: this.shift.id,
          driver_id: this.shift.driver_id,
          motorcycle_id: this.shift.motorcycle_id,
          start_time: this.formatDateForInput(this.shift.start_time),
          end_time: this.formatDateForInput(this.shift.end_time),
          status: this.shift.status
        });

        // Si está en modo view, deshabilitar todos los campos
        if (this.mode === 1) {
          this.theFormGroup.disable();
        }

        console.log('Shift fetched successfully:', this.shift);
      },
      error: (error) => {
        console.error('Error fetching shift:', error);
        Swal.fire('Error', 'Could not load shift details', 'error');
      }
    });
  }

  back() {
    this.router.navigate(['/shifts/list']);
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

    // Convertir las fechas al formato ISO antes de enviar
    const shiftData = {
      ...this.theFormGroup.value,
      start_time: new Date(this.theFormGroup.value.start_time).toISOString(),
      end_time: this.theFormGroup.value.end_time ? 
        new Date(this.theFormGroup.value.end_time).toISOString() : null
    };

    this.shiftService.create(shiftData).subscribe({
      next: (shift) => {
        console.log('Shift created successfully:', shift);
        Swal.fire({
          title: 'Created!',
          text: 'Shift created successfully.',
          icon: 'success',
        });
        this.router.navigate(['/shifts/list']);
      },
      error: (error) => {
        console.error('Error creating shift:', error);
        Swal.fire('Error', 'Could not create shift', 'error');
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

    // Convertir las fechas al formato ISO antes de enviar
    const shiftData = {
      ...this.theFormGroup.value,
      start_time: new Date(this.theFormGroup.value.start_time).toISOString(),
      end_time: this.theFormGroup.value.end_time ? 
        new Date(this.theFormGroup.value.end_time).toISOString() : null
    };

    this.shiftService.update(shiftData).subscribe({
      next: (shift) => {
        console.log('Shift updated successfully:', shift);
        Swal.fire({
          title: 'Updated!',
          text: 'Shift updated successfully.',
          icon: 'success',
        });
        this.router.navigate(['/shifts/list']);
      },
      error: (error) => {
        console.error('Error updating shift:', error);
        Swal.fire('Error', 'Could not update shift', 'error');
      }
    });
  }
}