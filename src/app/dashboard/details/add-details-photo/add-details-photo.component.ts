import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';
import { DialogService } from 'src/app/services/dialog.service';
import { takeUntil } from 'rxjs/operators';
import { ImgCropperConfig } from '@alyle/ui/image-cropper';

@Component({
  selector: 'app-add-details-photo',
  templateUrl: './add-details-photo.component.html',
  styleUrls: ['./add-details-photo.component.scss']
})
export class AddDetailsPhotoComponent implements OnInit {

  destroy$: Subject<null> = new Subject();
  user: firebase.User;
  @Output() close = new EventEmitter();
  @Input() sourceData;
  updated = false;

  constructor(
    private readonly authService: AuthService,
    private readonly storageService: StorageService,
    private dialogService: DialogService
  ) {
  }

  ngOnInit(): void {
    this.authService.user
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: firebase.User) => (this.user = user));
  }

  fileChangeEvent(event: any): void {
    this.updated = false;
    const reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);

    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () => {
        const requiredHeight = this.sourceData.cropperConfig.output.height;
        const requiredWidth = this.sourceData.cropperConfig.output.width;
        if (img.naturalHeight >= requiredHeight && img.naturalWidth >= requiredWidth) {
          this.cropPictures({ imageChangedEvent: event });
        } else {
          alert(`The photo is too small. Please select a photo with height of ${requiredHeight} and width of ${requiredWidth} pixels atleast`);
        }
      };
    };
  }

  cropPictures(firstPictureSource: { imageChangedEvent?, image? }) {
    this.dialogService.cropImage(firstPictureSource, this.sourceData.cropperConfig, 'labels.adjustPicture').subscribe(
      croppedPicture => {
        if (croppedPicture) {
          this.updated = true;
          this.sourceData.imgSrc = croppedPicture;
        }
      }
    )
  }

  returnPhoto() {
    this.close.emit({
      ...this.sourceData,
      updated: this.updated
    });
  }

  ngOnDestroy() {
    this.destroy$.next(null);
  }

}
