import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { ImageCropperComponent } from '../dialogs/image-cropper/image-cropper.component';
import { ImgCropperConfig } from '@alyle/ui/image-cropper';
import { AddDrinkComponent } from '../dashboard/menu/add-meal/add-drink/add-drink.component';
import { AddOptionComponent } from '../dashboard/menu/add-meal/add-option/add-option.component';
import { EditOptionComponent } from '../dashboard/menu/edit-option/edit-option.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(
    public dialog: MatDialog,
    private translate: TranslateService
  ) { }

  confirm(title, message): Observable<any> {
    const dialogData = new ConfirmDialogModel(this.translate.instant(title), this.translate.instant(message));
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      minWidth: '300px',
      maxWidth: '600px',
      data: dialogData
    });
    return dialogRef.afterClosed();
  }

  drinksList(): Observable<any> {
    const dialogRef = this.dialog.open(AddDrinkComponent, {
      minWidth: '320px',
      maxWidth: '600px',
      panelClass: 'drinks-dialog-container'
      // data: dialogData
    });
    return dialogRef.afterClosed();
  }

  options(addedLists): Observable<any> {
    const dialogRef = this.dialog.open(AddOptionComponent, {
      minWidth: '320px',
      maxWidth: '600px',
      panelClass: 'options-dialog-container',
      data: {
        addedLists
      }
    });
    return dialogRef.afterClosed();
  }

  optionsEdit(): Observable<any> {
    const dialogRef = this.dialog.open(EditOptionComponent, {
      minWidth: '320px',
      maxWidth: '600px',
      panelClass: 'options-dialog-container'
    });
    return dialogRef.afterClosed();
  }

  cropImage(source: { imageChangedEvent?, image? }, imageCropperConfig: ImgCropperConfig, title): Observable<any> {
    const dialogRef = this.dialog.open(ImageCropperComponent, {
      minWidth: '300px',
      data: {
        source,
        imageCropperConfig,
        title
      },
    });
    return dialogRef.afterClosed();
  }
}
