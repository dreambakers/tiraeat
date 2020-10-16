import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { ImageCropperComponent } from '../dialogs/image-cropper/image-cropper.component';
import { ImgCropperConfig } from '@alyle/ui/image-cropper';

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
