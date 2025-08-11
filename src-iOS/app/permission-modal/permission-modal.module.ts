import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { PermissionModalPageRoutingModule } from './permission-modal-routing.module';

import { PermissionModalPage } from './permission-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PermissionModalPageRoutingModule,
    TranslateModule
  ],
  declarations: [PermissionModalPage]
})
export class PermissionModalPageModule {}
