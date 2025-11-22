import { Component, OnInit } from '@angular/core';
import { Address } from 'src/app/models/Address';
import { AddressService } from 'src/app/services/address.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  addresses: Address[] = [];

  constructor(private service: AddressService) { }

  ngOnInit(): void {
    this.service.list().subscribe(data => {
      this.addresses = data;
    });
  }

  delete(id: number) {
    console.log("Delete address with id:", id);
    Swal.fire({
      title: 'Eliminar',
      text: "¿Está seguro de que desea eliminar esta dirección?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.delete(id).subscribe(data => {
          Swal.fire(
            '¡Eliminado!',
            'Dirección eliminada exitosamente.',
            'success'
          )
          this.ngOnInit();
        });
      }
    })
  }
}