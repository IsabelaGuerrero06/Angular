import { Component, OnInit } from '@angular/core';
import { Photo } from 'src/app/models/Photo';
import { PhotoService } from 'src/app/services/photo.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  photos: Photo[] = [];
  backendUrl = environment.url_backend;

  constructor(private service: PhotoService) { }

  ngOnInit(): void {
    this.service.list().subscribe(data => {
      this.photos = data;
    });
  }

  delete(id: number) {
    console.log("Delete photo with id:", id);
    Swal.fire({
      title: 'Delete',
      text: "Are you sure you want to delete this photo?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.delete(id).subscribe(data => {
          Swal.fire(
            'Deleted!',
            'Photo successfully deleted.',
            'success'
          );
          this.ngOnInit();
        });
      }
    });
  }

  // Obtener la URL completa de la imagen
  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    return `${this.backendUrl}/${imageUrl}`;
  }

  // Ver imagen en tamaño completo
  viewFullImage(imageUrl: string) {
    const fullUrl = this.getImageUrl(imageUrl);
    Swal.fire({
      imageUrl: fullUrl,
      imageAlt: 'Photo',
      showConfirmButton: false,
      showCloseButton: true,
      width: '80%'
    });
  }
}
