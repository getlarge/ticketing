import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { LayoutComponent } from './layout.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: LayoutComponent,
        // children: [
        //   { path: 'sign-in', component: SignInComponent },
        //   { path: 'sign-up', component: SignUpComponent },
        // ],
      },
    ]),
  ],
  declarations: [LayoutComponent],
})
export class UserModule {}
