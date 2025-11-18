import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Issue } from 'src/app/models/Issue';
import { Motorcycle } from 'src/app/models/Motorcycle';
import { IssueService } from 'src/app/services/issue.service';
import { MotorcycleService } from 'src/app/services/motorcycle.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  mode: number; // 1: view, 2: create, 3: update
  issue: Issue;
  theFormGroup: FormGroup;
  trySend: boolean;

  // Listas para los selects
  motorcycles: Motorcycle[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private issueService: IssueService,
    private motorcycleService: MotorcycleService,
    private router: Router,
    private theFormBuilder: FormBuilder
  ) {
    this.trySend = false;
    this.issue = { id: 0 };
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

    // Cargar lista de motorcycles
    this.loadMotorcycles();

    if (this.activatedRoute.snapshot.params.id) {
      this.issue.id = this.activatedRoute.snapshot.params.id;
      this.getIssue(this.issue.id);
    }
  }

  configFormGroup() {
    this.theFormGroup = this.theFormBuilder.group({
      id: [0, []],
      motorcycle_id: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      issue_type: ['', [Validators.required, Validators.minLength(3)]],
      date_reported: ['', [Validators.required]],
      status: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  get getTheFormGroup() {
    return this.theFormGroup.controls;
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

  getIssue(id: number) {
    this.issueService.view(id).subscribe({
      next: (response) => {
        this.issue = response;

        this.theFormGroup.patchValue({
          id: this.issue.id,
          motorcycle_id: this.issue.motorcycle_id,
          description: this.issue.description,
          issue_type: this.issue.issue_type,
          date_reported: this.formatDateForInput(this.issue.date_reported),
          status: this.issue.status
        });

        // Si está en modo view, deshabilitar todos los campos
        if (this.mode === 1) {
          this.theFormGroup.disable();
        }

        console.log('Issue fetched successfully:', this.issue);
      },
      error: (error) => {
        console.error('Error fetching issue:', error);
        Swal.fire('Error', 'Could not load issue details', 'error');
      }
    });
  }

  back() {
    this.router.navigate(['/issues/list']);
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

    // Convertir la fecha al formato ISO antes de enviar
    const issueData = {
      ...this.theFormGroup.value,
      date_reported: new Date(this.theFormGroup.value.date_reported).toISOString()
    };

    this.issueService.create(issueData).subscribe({
      next: (issue) => {
        console.log('Issue created successfully:', issue);
        Swal.fire({
          title: 'Created!',
          text: 'Issue created successfully.',
          icon: 'success',
        });
        this.router.navigate(['/issues/list']);
      },
      error: (error) => {
        console.error('Error creating issue:', error);
        Swal.fire('Error', 'Could not create issue', 'error');
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

    // Convertir la fecha al formato ISO antes de enviar
    const issueData = {
      ...this.theFormGroup.value,
      date_reported: new Date(this.theFormGroup.value.date_reported).toISOString()
    };

    this.issueService.update(issueData).subscribe({
      next: (issue) => {
        console.log('Issue updated successfully:', issue);
        Swal.fire({
          title: 'Updated!',
          text: 'Issue updated successfully.',
          icon: 'success',
        });
        this.router.navigate(['/issues/list']);
      },
      error: (error) => {
        console.error('Error updating issue:', error);
        Swal.fire('Error', 'Could not update issue', 'error');
      }
    });
  }
}