import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { ImageCropperComponent } from '../dialogs/image-cropper/image-cropper.component';

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
      data: dialogData
    });
    return dialogRef.afterClosed();
  }

  cropImage(imageChangedEvent): Observable<any> {
    const dialogRef = this.dialog.open(ImageCropperComponent, {
      minWidth: '300px',
      data: {
        imageChangedEvent
      },
      panelClass:'p-0'
    });
    return dialogRef.afterClosed();
  }
}
