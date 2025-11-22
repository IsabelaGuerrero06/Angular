import { Component, OnInit } from '@angular/core';
import { Order } from 'src/app/models/Order';
import { OrderService } from 'src/app/services/order.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  orders: Order[] = [];

  constructor(private service: OrderService) { }

  ngOnInit(): void {
    this.service.list().subscribe(data => {
      this.orders = data;
    });
  }

  delete(id: number) {
    console.log("Delete order with id:", id);
    Swal.fire({
      title: 'Delete',
      text: "Are you sure you want to delete this order?",
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
            'Order successfully deleted.',
            'success'
          );
          this.ngOnInit();
        });
      }
    });
  }
}