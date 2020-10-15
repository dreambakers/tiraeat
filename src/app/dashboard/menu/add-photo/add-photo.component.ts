import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from '../../../services/storage.service';
import { takeUntil, catchError } from 'rxjs/operators';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-add-photo',
  templateUrl: './add-photo.component.html',
  styleUrls: ['./add-photo.component.scss']
})
export class AddPhotoComponent implements OnInit {

  destroy$: Subject<null> = new Subject();
  fileToUpload: File;
  kittyImagePreview: string | ArrayBuffer;
  pictureForm: FormGroup;
  user: firebase.User;
  test;
  show = false;

  @Input() imageChangedEvent: any = '';

  constructor(
    private readonly authService: AuthService,
    private readonly formBuilder: FormBuilder,
    private readonly storageService: StorageService,
    private dialogService: DialogService
    // private readonly utilService: UtilService,
  ) {
  }

  ngOnInit(): void {
    this.pictureForm = this.formBuilder.group({
      photo: [null, Validators.required],
      description: [null, Validators.required],
    });

    this.authService.user
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: firebase.User) => (this.user = user));

    this.pictureForm
      .get('photo')
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((newValue) => {
        this.handleFileChange(newValue.files);
      });
  }

  handleFileChange([ kittyImage ]) {
    this.fileToUpload = kittyImage;
    const reader = new FileReader();
    reader.onload = (loadEvent) => (this.kittyImagePreview =
    loadEvent.target.result);
    reader.readAsDataURL(kittyImage);
  }


  postKitty() {
    // this.submitted = true;
    const mediaFolderPath = `${this.user.email.split('@')[0]}/picPathSmall/`;

    const { downloadUrl$, uploadProgress$ } = this.storageService.uploadFileAndGetMetadata(
      mediaFolderPath,
      this.fileToUpload,
    );

    // this.uploadProgress$ = uploadProgress$;

    downloadUrl$
      .pipe(
        takeUntil(this.destroy$),
        // catchError((error:ant) => {
        //   console.log(error)
        // }),
      )
      .subscribe((downloadUrl) => {

        console.log(downloadUrl)

        // this.submitted = false;
        // this.router.navigate([ `/${ FEED }` ]);
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
        const height = img.naturalHeight;
        const width = img.naturalWidth;

        if (img.naturalHeight >= 250 && img.naturalWidth >= 400) {
          this.dialogService.cropImage(this.imageChangedEvent).subscribe(
            res => {
              this.test = res;
              console.log(res)
            }
          )
        } else {
          alert('The photo is too small. Please select a photo with height of 250px and width of 400 pixels atleast');
        }
      };
    };
  }

  onImageCropped(tes) {
    this.test = tes;
  }


  ngOnDestroy() {
    this.destroy$.next(null);
  }
}
