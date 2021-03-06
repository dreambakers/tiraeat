import { BrowserModule, HAMMER_GESTURE_CONFIG, HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule } from '@angular/common/http';

/** Alyle UI */
import {
  LyTheme2,
  StyleRenderer,
  LY_THEME,
  LY_THEME_NAME,
  LY_THEME_GLOBAL_VARIABLES,
  LyHammerGestureConfig
} from '@alyle/ui';
import { MinimaLight } from '@alyle/ui/themes/minima';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LyImageCropperModule } from '@alyle/ui/image-cropper';
import { LyIconModule } from '@alyle/ui/icon';
import { LySliderModule } from '@alyle/ui/slider';

import { environment } from 'src/environments/environment';

import { AppRoutingModule } from './app-routing.module';

import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireAuthGuard } from '@angular/fire/auth-guard';
import { AngularFirestoreModule } from '@angular/fire/firestore';

import { DetailsComponent } from './dashboard/details/details.component';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AddMealComponent } from './dashboard/menu/add-meal/add-meal.component';
import { ImageCropperComponent } from './dialogs/image-cropper/image-cropper.component';
import { AddPhotoComponent } from './dashboard/menu/add-meal/add-photo/add-photo.component';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';
import { MenuComponent } from './dashboard/menu/menu.component';
import { AddCategoryComponent } from './dashboard/menu/add-category/add-category.component';
import { LoginComponent } from './login/login.component';
import { AddOptionComponent } from './dashboard/menu/add-meal/add-option/add-option.component';
import { ExportComponent } from './export/export.component';
import { ImportComponent } from './import/import.component';
import { AddDrinkComponent } from './dashboard/menu/add-meal/add-drink/add-drink.component';
import { AddDetailsPhotoComponent } from './dashboard/details/add-details-photo/add-details-photo.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { EditOptionComponent } from './dashboard/menu/edit-option/edit-option.component';

import { EnglishToHebrewPipe } from './pipes/english-to-hebrew.pipe';

import { PendingChangesGuard } from './guards/pending-changes.guard';

import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSliderModule } from '@angular/material/slider';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';

// import ngx-translate and the http loader
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    DetailsComponent,
    MenuComponent,
    AddCategoryComponent,
    AddMealComponent,
    LoginComponent,
    ConfirmDialogComponent,
    AddPhotoComponent,
    ImageCropperComponent,
    AddOptionComponent,
    ExportComponent,
    ImportComponent,
    AddDrinkComponent,
    AddDetailsPhotoComponent,
    EnglishToHebrewPipe,
    NotFoundComponent,
    EditOptionComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    HammerModule,
    CommonModule,
    FormsModule,
    LyImageCropperModule,
    LyIconModule,
    AppRoutingModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireAuthModule,
    MatTabsModule,
    MatButtonModule,
    MatInputModule,
    MatDialogModule,
    MatSliderModule,
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
      }
    }),
    DragDropModule,
    MatRadioModule,
    MatChipsModule
  ],
  providers: [
    AngularFireAuthGuard,
    PendingChangesGuard,
    [ LyTheme2 ],
    [ StyleRenderer ],
    { provide: LY_THEME_NAME, useValue: 'minima-light' },
    {
      provide: LY_THEME,
      useClass: MinimaLight,
      multi: false
    },
    // Gestures
    { provide: HAMMER_GESTURE_CONFIG, useClass: LyHammerGestureConfig }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/');
}
