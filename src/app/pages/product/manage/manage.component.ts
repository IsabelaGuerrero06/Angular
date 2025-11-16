import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from 'src/app/models/Product';
import { ProductService } from 'src/app/services/product.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
//Constructor: sirve para inyectar dependencias
export class ManageComponent implements OnInit {
  mode: number; // 1: view, 2: create, 3: update
  product: Product;
  theFormGroup: FormGroup; // Policía de formulario
  trySend: boolean;
  constructor(private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private router: Router,
    private theFormBuilder: FormBuilder //Definir las reglas
  ) {
    this.trySend = false;
    this.product = { id: 0 };
    this.configFormGroup()
  }

  ngOnInit(): void {
    const currentUrl = this.activatedRoute.snapshot.url.join('/');
    if (currentUrl.includes('view')) {
      this.mode = 1;
    } else if (currentUrl.includes('create')) {
      this.mode = 2;
    } else if (currentUrl.includes('update')) {
      this.mode = 3;
    }
    if (this.activatedRoute.snapshot.params.id) {
      this.product.id = this.activatedRoute.snapshot.params.id
      this.getProduct(this.product.id)
    }

  }
  configFormGroup() {
    this.theFormGroup = this.theFormBuilder.group({
      // primer elemento del vector, valor por defecto
      // lista, serán las reglas
      id: [0,[]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(2)]],
      price: [0, [Validators.required, Validators.min(100), Validators.max(100000000)]],
      category: ['', [Validators.required, Validators.minLength(2)]]
    })
  }


  get getTheFormGroup() {
    return this.theFormGroup.controls
  }

  getProduct(id: number) {
    this.productService.view(id).subscribe({
      next: (response) => {
        this.product = response;

        this.theFormGroup.patchValue({
          id: this.product.id,
          name: this.product.name,
          description: this.product.description,
          price: this.product.price,
          category: this.product.category
        });
        
        console.log('Product fetched successfully:', this.product);
      },
      error: (error) => {
        console.error('Error fetching product:', error);
      }
    });
  }
  back() {
    this.router.navigate(['/products/list']);
  }

  create() {
    this.trySend = true;
    if (this.theFormGroup.invalid) {
      Swal.fire({
        title: 'Error!',
        text: 'Por favor, complete todos los campos requeridos.',
        icon: 'error',
      })
      return;
    }
    this.productService.create(this.theFormGroup.value).subscribe({
      next: (product) => {
        console.log('Product created successfully:', product);
        Swal.fire({
          title: 'Creado!',
          text: 'Registro creado correctamente.',
          icon: 'success',
        })
        this.router.navigate(['/products/list']);
      },
      error: (error) => {
        console.error('Error creating product:', error);
      }
    });
  }
  update() {
    this.trySend = true;
    if (this.theFormGroup.invalid) {
      Swal.fire({
        title: 'Error!',
        text: 'Por favor, complete todos los campos requeridos.',
        icon: 'error',
      })
      return;
    }
    this.productService.update(this.theFormGroup.value).subscribe({
      next: (product) => {
        console.log('Product updated successfully:', product);
        Swal.fire({
          title: 'Actualizado!',
          text: 'Registro actualizado correctamente.',
          icon: 'success',
        })
        this.router.navigate(['/products/list']);
      },
      error: (error) => {
        console.error('Error updating product:', error);
      }
    });
  }

}