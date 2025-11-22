import { Component, OnInit } from '@angular/core';
import { Motorcycle } from 'src/app/models/Motorcycle';
import { MotorcycleService } from 'src/app/services/motorcycle.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  motorcycles: Motorcycle[] = [];

  constructor(private service: MotorcycleService) { }

  ngOnInit(): void {
    this.service.list().subscribe(data => {
      this.motorcycles = data;
    });
  }

  delete(id: number) {
    console.log("Delete motorcycle with id:", id);
    Swal.fire({
      title: 'Delete',
      text: "Are you sure you want to delete this motorcycle?",
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
            'Motorcycle successfully deleted.',
            'success'
          );
          this.ngOnInit();
        });
      }
    });
  }
}
