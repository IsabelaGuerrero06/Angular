import { Component, OnInit } from '@angular/core';
import { Shift } from 'src/app/models/Shift';
import { ShiftService } from 'src/app/services/shift.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  shifts: Shift[] = [];

  constructor(private service: ShiftService) { }

  ngOnInit(): void {
    this.service.list().subscribe(data => {
      this.shifts = data;
    });
  }

  delete(id: number) {
    console.log("Delete shift with id:", id);
    Swal.fire({
      title: 'Delete',
      text: "Are you sure you want to delete this shift?",
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
            'Shift successfully deleted.',
            'success'
          );
          this.ngOnInit();
        });
      }
    });
  }

  endShift(id: number) {
    Swal.fire({
      title: 'End Shift',
      text: "Are you sure you want to end this shift?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, end shift',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.endShift(id).subscribe(data => {
          Swal.fire(
            'Completed!',
            'Shift ended successfully.',
            'success'
          );
          this.ngOnInit();
        });
      }
    });
  }
}