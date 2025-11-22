import { Component, OnInit } from '@angular/core';
import { Customer } from 'src/app/models/Customer';
import { CustomerService } from 'src/app/services/customer.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  customers: Customer[] = [];

  constructor(private service: CustomerService) { }

  ngOnInit(): void {
    this.service.list().subscribe(data => {
      this.customers = data;
    });
  }

  delete(id: number) {
    console.log("Delete customer with id:", id);
    Swal.fire({
      title: 'Delete',
      text: "Are you sure you want to delete this customer?",
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
            'Customer successfully deleted.',
            'success'
          );
          this.ngOnInit();
        });
      }
    });
  }
}