import { Component, OnInit } from '@angular/core';
import { Issue } from 'src/app/models/Issue';
import { IssueService } from 'src/app/services/issue.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  issues : Issue [] = [];


  constructor( private service: IssueService) { }

  ngOnInit(): void {

   this.service.list().subscribe(data=>{
    this.issues=data;
    });
  }
delete(id: number) {
    console.log("Delete issue with id:", id);
    Swal.fire({
      title: 'Delete',
      text: "Are you sure you want to delete this issue?",
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
              'Issue successfully deleted.',
              'success'
            )
            this.ngOnInit();
          });
      }
    })
  }
}
