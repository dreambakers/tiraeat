import { Component, ChangeDetectionStrategy, ViewChild, AfterViewInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { Platform, StyleRenderer, lyl, WithStyles } from '@alyle/ui';
import { ImgCropperConfig, ImgCropperEvent, LyImageCropper, ImgCropperErrorEvent } from '@alyle/ui/image-cropper';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

const STYLES = () => ({
  cropper: lyl `{
    max-width: 400px
    height: 300px
  }`
});

@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    StyleRenderer
  ],
})
export class ImageCropperComponent implements WithStyles, AfterViewInit {
  classes = this.sRenderer.renderSheet(STYLES);
  croppedImage?: string;
  scale: number;
  @ViewChild(LyImageCropper) cropper: LyImageCropper;
  @Input() imageChangedEvent;
  outputImg;
  imgCropperConfig: ImgCropperConfig;

  constructor(
    readonly sRenderer: StyleRenderer,
    public dialogRef: MatDialogRef<ImageCropperComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  ngAfterViewInit() {
    this.imgCropperConfig = { ...this.data.imageCropperConfig, type: 'image/jpeg' };
    if (this.data.source.image) {
      this.cropper.setImageUrl(this.data.source.image)
    } else {
      this.cropper.selectInputEvent(this.data.source.imageChangedEvent);
    }
    this.cropper.ready.subscribe(
      res => {
        setTimeout(() => {
          this.cropper.center();
          // for some reason, the cropper isn't perfectly centered the first time around :(
          setTimeout(() => {
            this.cropper.center();
          },50);
        },100);
      }
    );
  }

  getDialogTitle() {
    return this.data.title;
  }

  onDismiss() {
    this.dialogRef.close(false);
  }

  onConfirm() {
    this.cropper.crop();
  }

  onCropped(e: ImgCropperEvent) {
    this.croppedImage = e.dataURL;
    this.dialogRef.close(this.croppedImage);
  }
  onLoaded(e: ImgCropperEvent) {
    this.outputImg = e;
  }
  onError(e: ImgCropperErrorEvent) {
    console.warn(`'${e.name}' is not a valid image`, e);
  }

}
