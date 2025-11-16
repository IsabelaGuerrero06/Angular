import { Component, OnInit } from '@angular/core';
import { Restaurant } from 'src/app/models/Restaurant';
import { RestaurantService } from 'src/app/services/restaurant.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  restaurants : Restaurant [] = [];


  constructor( private service: RestaurantService) { }

  ngOnInit(): void {

   this.service.list().subscribe(data=>{
    this.restaurants=data;
    });
  }
delete(id: number) {
    console.log("Delete restaurant with id:", id);
    Swal.fire({
      title: 'Delete',
      text: "Are you sure you want to delete this restaurant?",
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
              'Restaurant successfully deleted.',
              'success'
            )
            this.ngOnInit();
          });
      }
    })
  }
}
