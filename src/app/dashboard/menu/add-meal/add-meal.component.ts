import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MenuService } from 'src/app/services/menu.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthService } from 'src/app/services/auth.service';
import { takeUntil } from 'rxjs/operators';
import { StorageService } from 'src/app/services/storage.service';
import { Subject, Observable, forkJoin } from 'rxjs';

@Component({
  selector: 'app-add-meal',
  templateUrl: './add-meal.component.html',
  styleUrls: ['./add-meal.component.scss'],
  animations: [
    trigger('myAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class AddMealComponent implements OnInit {

  @Output() close:EventEmitter<Boolean> = new EventEmitter();
  @Output() mealAdded:EventEmitter<Boolean> = new EventEmitter();
  @Output() mealEdited = new EventEmitter();
  @Input() category;
  @Input() mealToEdit;
  destroy$: Subject<null> = new Subject();
  images;
  loading = false;

  sections = {
    manageMeal: 'manageMeal',
    addPhoto: 'addPhoto',
    addOptions: 'addOptions'
  }
  section = this.sections.manageMeal;

  addMealForm;
  user;

  constructor(
    private formBuilder: FormBuilder,
    private menuService: MenuService,
    private authService: AuthService,
    private storageService: StorageService
  ) { }

  ngOnInit(): void {
    this.authService.user
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: firebase.User) => (this.user = user));

    this.addMealForm = this.formBuilder.group({
      mealName: [this.mealToEdit?.mealName, [Validators.required]],
      mealDesc: [this.mealToEdit?.mealDesc],
      price: [this.mealToEdit?.price],
      mealCat: [this.mealToEdit?.mealCat || this.category.name],
      positionByCat: [
        this.mealToEdit?.positionByCat || ((this.category?.meals?.length || 0) + 1)
      ]
    });
  }

  updateSection(newSection) {
    this.section = this.sections[newSection];
  }

  onAddPhotoClose(event) {
    this.updateSection(this.sections.manageMeal);
    if (event?.images) {
      this.images = event.images;
    }
  }

  dataURLtoFile(dataurl, filename) {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
  }

  uploadImages() {
    let observables: Observable<string>[];

    for (let key of Object.keys(this.images)) {
      const img = this.images[key];
      const mealId = this.user.email.split('@')[0] + this.addMealForm.value['positionByCat'];

      const mediaFolderPath = `${this.user.email.split('@')[0]}/picPath${key}/`;
      const { downloadUrl$, uploadProgress$ } = this.storageService.uploadFileAndGetMetadata(
        mediaFolderPath,
        this.dataURLtoFile(img, `${mealId}`)
      );

      observables = [
        ...observables || [],
        downloadUrl$
      ];
    }

    return observables;
  }

  onSubmit() {
    this.loading = true;

    if (this.mealToEdit) {
      this.menuService.editMeal({...this.addMealForm.value, id: this.mealToEdit.id}).then(
        updatedMeal => {
          this.mealEdited.emit(updatedMeal);
          this.close.emit();
        }
      );
    } else {
      if (this.images) {
        forkJoin(this.uploadImages()).subscribe(
          results => {
            if (results) {
              this.menuService.addMeal({
                ... this.addMealForm.value,
                picPathBig: results[0],
                picPathSmall: results[1]
              }).subscribe(
                newMeal => {
                  this.mealAdded.emit(newMeal);
                  this.close.emit();
                }, err => {
                  this.loading = false;
                  console.log(err);
                }
              );
            }
          }, err => {
            this.loading = false;
            console.log(err);
          }
        );
      } else {
        this.menuService.addMeal(this.addMealForm.value).subscribe(
          newMeal => {
            this.mealAdded.emit(newMeal);
            this.close.emit();
          }, err => {
            this.loading = false;
            console.log(err);
          }
        );
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next(null);
  }
}
