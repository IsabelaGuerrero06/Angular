import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/Product';
import { ProductService } from 'src/app/services/product.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  products : Product [] = [];


  constructor( private service: ProductService) { }

  ngOnInit(): void {

   this.service.list().subscribe(data=>{
    this.products=data;
    });
  }
delete(id: number) {
    console.log("Delete product with id:", id);
    Swal.fire({
      title: 'Delete',
      text: "Are you sure you want to delete this product?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.delete(id).
          subscribe(data => {
            Swal.fire(
              'Deleted!',
              'Product successfully deleted.',
              'success'
            )
            this.ngOnInit();
          });
      }
    })
  }
}
