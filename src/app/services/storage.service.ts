import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/storage';
import { from, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { map,switchMap } from 'rxjs/operators';
import {NgxImageCompressService} from 'ngx-image-compress';

export interface FilesUploadMetadata {
  uploadProgress$: Observable<number>;
  downloadUrl$: Observable<string>;
}

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(private readonly storage: AngularFireStorage,private imageCompress: NgxImageCompressService) {}

  dataURLtoFile(dataurl, filename) {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
  }

  async uploadFileAndGetMetadata(
    mediaFolderPath: string,
    fileToUpload: File,
  ) {

    const promise  = new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) =>  {

        console.warn('Size was is now:', this.imageCompress.byteCount(e.target.result));


        this.imageCompress.compressFile(e.target.result, 50, 100, 50).then(
          compressedImg => {
            console.warn('Size in bytes is now:', this.imageCompress.byteCount(compressedImg));

            const { name } = fileToUpload;

            fileToUpload = this.dataURLtoFile(compressedImg, name);
            const filePath = `${mediaFolderPath}/${name}`;

            const uploadTask: AngularFireUploadTask = this.storage.upload(
              filePath,
              fileToUpload,
            );

            resolve(this.getDownloadUrl$(uploadTask, filePath));
          }
        );

     }

      reader.readAsDataURL(fileToUpload);
    })

    return promise;
  }

  private getDownloadUrl$(
    uploadTask: AngularFireUploadTask,
    path: string,
  ): Observable<string> {
    return from(uploadTask).pipe(
      switchMap((_) => this.storage.ref(path).getDownloadURL()),
    );
  }
}
