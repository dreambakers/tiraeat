import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from '../../../services/storage.service';
import { takeUntil, catchError } from 'rxjs/operators';
import { DialogService } from 'src/app/services/dialog.service';
import { ImgCropperConfig } from '@alyle/ui/image-cropper';

@Component({
  selector: 'app-add-photo',
  templateUrl: './add-photo.component.html',
  styleUrls: ['./add-photo.component.scss']
})
export class AddPhotoComponent implements OnInit {

  destroy$: Subject<null> = new Subject();
  user: firebase.User;
  @Output() close = new EventEmitter();
  @Input() imageChangedEvent: any = '';

  picture1: File;
  picture2: File;

  constructor(
    private readonly authService: AuthService,
    private readonly formBuilder: FormBuilder,
    private readonly storageService: StorageService,
    private dialogService: DialogService
  ) {
  }

  ngOnInit(): void {
    this.authService.user
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: firebase.User) => (this.user = user));
  }

  dataURLtoFile(dataurl, filename) {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
  }

  uploadPhoto() {
    const mediaFolderPath = `${this.user.email.split('@')[0]}/picPathBig/`;
    const { downloadUrl$, uploadProgress$ } = this.storageService.uploadFileAndGetMetadata(
      mediaFolderPath,
      this.dataURLtoFile(this.picture1, 'test.png')
    );
    uploadProgress$.subscribe(
      res => {
        console.log(res)
      }
    );
    downloadUrl$
      .pipe(
        takeUntil(this.destroy$),
        // catchError((error:ant) => {
        //   console.log(error)
        // }),
      )
      .subscribe((downloadUrl) => {
        console.log(downloadUrl)
      });
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;

    const reader = new FileReader();
    reader.readAsDataURL(this.imageChangedEvent.target.files[0]);

    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () => {
        if (img.naturalHeight >= 250 && img.naturalWidth >= 400) {
          const firstPictureConfig: ImgCropperConfig = {
            keepAspectRatio: true,
            width: 200, // Default `250`
            height: 125, // Default `200`
            // type: 'image/png', // Or you can also use `image/jpeg`,
            output: {
              width: 400,
              height: 250
            },
          }
          this.dialogService.cropImage({ imageChangedEvent: this.imageChangedEvent }, firstPictureConfig, 'labels.adjustFirstPicture').subscribe(
            picture1 => {
              if (picture1) {
                this.picture1 = picture1;

                const secondPictureConfig: ImgCropperConfig = {
                 keepAspectRatio: true,
                  width: 150,
                  height: 150,
                  output: {
                    width: 150,
                    height: 150
                  }
                }
                this.dialogService.cropImage({ image: picture1 }, secondPictureConfig, 'labels.adjustSecondPicture').subscribe(
                  picture2 => {
                    if (picture2) {
                      this.picture2 = picture2;
                    }
                  }
                );
              }
            }
          )
        } else {
          alert('The photo is too small. Please select a photo with height of 250px and width of 400 pixels atleast');
        }
      };
    };
  }

  ngOnDestroy() {
    this.destroy$.next(null);
  }
}
