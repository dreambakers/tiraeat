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
  @Output() cropped = new EventEmitter();
  outputImg;

  myConfig: ImgCropperConfig = {
    keepAspectRatio: true,
    width: 200, // Default `250`
    height: 125, // Default `200`
    // type: 'image/png', // Or you can also use `image/jpeg`,
    output: {
      width: 400,
      height: 250
    },
  };

  constructor(
    readonly sRenderer: StyleRenderer,
    public dialogRef: MatDialogRef<ImageCropperComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImageCropperComponent
  ) { }

  ngAfterViewInit() {
    this.cropper.selectInputEvent(this.data.imageChangedEvent);
    this.cropper.center();
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
    console.log('img loaded', e);
  }
  onError(e: ImgCropperErrorEvent) {
    console.warn(`'${e.name}' is not a valid image`, e);
  }

}
