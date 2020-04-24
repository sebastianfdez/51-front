import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

const materialModules = [
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    FormsModule,
    MatInputModule,
    ReactiveFormsModule,
];

@NgModule({
    imports: [
        ...materialModules,
    ],
    exports: [
        ...materialModules,
    ],
})
export class MinimalMaterialModule { }