import { Component, OnInit } from '@angular/core';
import { Menu } from 'src/app/models/Menu';
import { MenuService } from 'src/app/services/menu.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  menus : Menu [] = [];


  constructor( private service: MenuService) { }

  ngOnInit(): void {

   this.service.list().subscribe(data=>{
    this.menus=data;
    });
  }
delete(id: number) {
    console.log("Delete menu with id:", id);
    Swal.fire({
      title: 'Delete',
      text: "Are you sure you want to delete this menu?",
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
              'Menu successfully deleted.',
              'success'
            )
            this.ngOnInit();
          });
      }
    })
  }
}
