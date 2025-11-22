import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Photo } from 'src/app/models/Photo';
import { Issue } from 'src/app/models/Issue';
import { PhotoService } from 'src/app/services/photo.service';
import { IssueService } from 'src/app/services/issue.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  mode: number; // 1: view, 2: create, 3: update
  photo: Photo;
  theFormGroup: FormGroup;
  trySend: boolean;
  backendUrl = environment.url_backend;

  // Lista de issues para el select
  issues: Issue[] = [];

  // Para el manejo de archivos
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private photoService: PhotoService,
    private issueService: IssueService,
    private router: Router,
    private theFormBuilder: FormBuilder
  ) {
    this.trySend = false;
    this.photo = { id: 0 };
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

    // Cargar lista de issues
    this.loadIssues();

    if (this.activatedRoute.snapshot.params.id) {
      this.photo.id = this.activatedRoute.snapshot.params.id;
      this.getPhoto(this.photo.id);
    }
  }

  configFormGroup() {
    this.theFormGroup = this.theFormBuilder.group({
      id: [0, []],
      issue_id: ['', [Validators.required]],
      image_url: ['', []],
      caption: ['', [Validators.minLength(3)]],
      taken_at: ['', []]
    });
  }

  get getTheFormGroup() {
    return this.theFormGroup.controls;
  }

  // Cargar lista de issues desde el backend
  loadIssues() {
    this.issueService.list().subscribe({
      next: (data) => {
        this.issues = data;
        console.log('Issues loaded:', this.issues);
      },
      error: (error) => {
        console.error('Error loading issues:', error);
        Swal.fire('Error', 'Could not load issues', 'error');
      }
    });
  }

  // Convertir fecha para el input datetime-local
  formatDateForInput(date: any): string {
    if (!date) return '';
    
    try {
      const d = new Date(date);
      return d.toISOString().slice(0, 16);
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  // Manejar la selección de archivo
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Obtener la URL completa de la imagen
  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    return `${this.backendUrl}/${imageUrl}`;
  }

  getPhoto(id: number) {
    this.photoService.list().subscribe({
      next: (photos) => {
        // Buscar la foto en la lista (ya que view() devuelve un blob)
        this.photo = photos.find(p => p.id === id) || { id: 0 };

        this.theFormGroup.patchValue({
          id: this.photo.id,
          issue_id: this.photo.issue_id,
          image_url: this.photo.image_url,
          caption: this.photo.caption,
          taken_at: this.formatDateForInput(this.photo.taken_at)
        });

        // Cargar preview de la imagen existente
        if (this.photo.image_url) {
          this.imagePreview = this.getImageUrl(this.photo.image_url);
        }

        // Si está en modo view, deshabilitar todos los campos
        if (this.mode === 1) {
          this.theFormGroup.disable();
        }

        console.log('Photo fetched successfully:', this.photo);
      },
      error: (error) => {
        console.error('Error fetching photo:', error);
        Swal.fire('Error', 'Could not load photo details', 'error');
      }
    });
  }

  back() {
    this.router.navigate(['/photos/list']);
  }

  create() {
    this.trySend = true;
    
    // Validar que se haya seleccionado un archivo
    if (!this.selectedFile) {
      Swal.fire({
        title: 'Error!',
        text: 'Please select an image file.',
        icon: 'error',
      });
      return;
    }

    if (this.theFormGroup.invalid) {
      Swal.fire({
        title: 'Error!',
        text: 'Please complete all required fields.',
        icon: 'error',
      });
      return;
    }

    // Preparar los datos de la foto
    const photoData: Partial<Photo> = {
      issue_id: this.theFormGroup.value.issue_id,
      caption: this.theFormGroup.value.caption,
      taken_at: this.theFormGroup.value.taken_at ? 
        new Date(this.theFormGroup.value.taken_at) : undefined
    };

    // Usar el método uploadPhoto del servicio
    this.photoService.uploadPhoto(photoData, this.selectedFile).subscribe({
      next: (photo) => {
        console.log('Photo uploaded successfully:', photo);
        Swal.fire({
          title: 'Created!',
          text: 'Photo uploaded successfully.',
          icon: 'success',
        });
        this.router.navigate(['/photos/list']);
      },
      error: (error) => {
        console.error('Error uploading photo:', error);
        Swal.fire('Error', 'Could not upload photo', 'error');
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

    // Si se seleccionó un nuevo archivo, hacer upload
    if (this.selectedFile) {
      const photoData: Partial<Photo> = {
        issue_id: this.theFormGroup.value.issue_id,
        caption: this.theFormGroup.value.caption,
        taken_at: this.theFormGroup.value.taken_at ? 
          new Date(this.theFormGroup.value.taken_at) : undefined
      };

      this.photoService.uploadPhoto(photoData, this.selectedFile).subscribe({
        next: (photo) => {
          console.log('Photo updated successfully:', photo);
          Swal.fire({
            title: 'Updated!',
            text: 'Photo updated successfully.',
            icon: 'success',
          });
          this.router.navigate(['/photos/list']);
        },
        error: (error) => {
          console.error('Error updating photo:', error);
          Swal.fire('Error', 'Could not update photo', 'error');
        }
      });
    } else {
      // Si no se seleccionó archivo, solo actualizar los datos
      const photoData = {
        ...this.theFormGroup.value,
        taken_at: this.theFormGroup.value.taken_at ? 
          new Date(this.theFormGroup.value.taken_at).toISOString() : null
      };

      this.photoService.update(photoData).subscribe({
        next: (photo) => {
          console.log('Photo updated successfully:', photo);
          Swal.fire({
            title: 'Updated!',
            text: 'Photo updated successfully.',
            icon: 'success',
          });
          this.router.navigate(['/photos/list']);
        },
        error: (error) => {
          console.error('Error updating photo:', error);
          Swal.fire('Error', 'Could not update photo', 'error');
        }
      });
    }
  }
}