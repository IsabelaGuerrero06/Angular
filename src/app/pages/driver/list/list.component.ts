import { Component, OnInit } from '@angular/core';
import { Driver } from 'src/app/models/Driver';
import { DriverService } from 'src/app/services/driver.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  drivers: Driver[] = [];

  constructor(private service: DriverService) { }

  ngOnInit(): void {
    this.service.list().subscribe(data => {
      this.drivers = data;
    });
  }

  delete(id: number) {
    console.log("Delete driver with id:", id);
    Swal.fire({
      title: 'Delete',
      text: "Are you sure you want to delete this driver?",
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
            'Driver successfully deleted.',
            'success'
          );
          this.ngOnInit();
        });
      }
    });
  }
}
