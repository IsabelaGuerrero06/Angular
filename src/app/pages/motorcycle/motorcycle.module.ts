import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MotorcycleRoutingModule } from './motorcycle-routing.module';
import { ListComponent } from './list/list.component';
import { ManageComponent } from './manage/manage.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ListComponent,
    ManageComponent
  ],
  imports: [
    CommonModule,
    MotorcycleRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class MotorcycleModule { }