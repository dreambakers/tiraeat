import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { MenuService } from 'src/app/services/menu.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthService } from 'src/app/services/auth.service';
import { takeUntil } from 'rxjs/operators';
import { StorageService } from 'src/app/services/storage.service';
import { Subject, Observable, forkJoin } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from 'src/app/services/dialog.service';
import { constants } from 'src/app/app.constants';

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

  @Output() close = new EventEmitter();
  @Output() mealAdded = new EventEmitter();
  @Output() mealEdited = new EventEmitter();
  @Input() category;
  @Input() mealToEdit;
  destroy$: Subject<null> = new Subject();
  images: { Big: any, Small: any };
  loading = false;
  constants = constants;

  sections = {
    manageMeal: 'manageMeal',
    addPhoto: 'addPhoto',
    addOptions: 'addOptions'
  }
  section = this.sections.manageMeal;

  addMealForm: FormGroup;
  user;

  constructor(
    private formBuilder: FormBuilder,
    private menuService: MenuService,
    private authService: AuthService,
    private storageService: StorageService,
    private translate: TranslateService,
    private dialogService: DialogService
  ) { }

  ngOnInit(): void {
    this.authService.user
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: firebase.User) => (this.user = user));

    this.addMealForm = this.formBuilder.group({
      mealName: [this.mealToEdit?.mealName, [Validators.required]],
      mealDesc: [this.mealToEdit?.mealDesc],
      price: [this.mealToEdit?.price, [Validators.pattern("^[0-9]*$")]],
      mealCat: [this.mealToEdit ? this.mealToEdit.mealCat : this.category.name],
      positionByCat: [
        this.mealToEdit?.positionByCat || ((this.category?.meals?.length || 0) + 1)
      ],
      mealOptions: this.formBuilder.array(this.setMealOptionsControls()),
      picPathBig: this.mealToEdit?.picPathBig || '',
      picPathSmall: this.mealToEdit?.picPathSmall || '',
    });
  }

  setMealOptionsControls() {
    const mealOptions = [];
    if (this.mealToEdit?.mealOptions) {
      for (let option of this.mealToEdit?.mealOptions) {
        mealOptions.push(this.formBuilder.group({
          opNameEn: option?.opNameEn,
          opNameHeb: option?.opNameHeb,
          opLimit: option?.opLimit,
          mandatory: option?.mandatory || (option?.opNameEn ? false : null)
        }));
      }
    }
    return mealOptions;
  }

  getMealOptionControls() {
    return (this.addMealForm.get('mealOptions') as FormArray).controls;
  }

  removeOption(itemIndex) {
    const items = this.addMealForm.get('mealOptions') as FormArray;
    items.removeAt(itemIndex);
  }

  addOption(optionListName) {
    const mealOptions = this.addMealForm.get('mealOptions') as FormArray;
    mealOptions.push(this.formBuilder.group({
      opNameEn: optionListName,
      opNameHeb: '',
      opLimit: 0,
      mandatory: false
    }));
  }

  getAddedOptionLists() {
   return this.addMealForm.get('mealOptions').value.map(
    option => option.opNameEn
   );
  }

  updateSection(newSection) {
    this.section = this.sections[newSection];
  }

  onAddPhotoClose(event) {
    this.updateSection(this.sections.manageMeal);
    if (event?.updated && event?.images) {
      this.images = event.images;
    }
  }

  getImageStatus() {
    if (this.imgSet) {
      return this.translate.instant('messages.imgSet');
    }
    return this.translate.instant('messages.noImgSet');
  }

  dataURLtoFile(dataurl, filename) {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
  }

  uploadImages(mealId) {
    let observables: Observable<string>[];

    for (let key of Object.keys(this.images)) {
      const img = this.images[key];
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

  openOptionsDialog() {
    this.dialogService.options(this.getAddedOptionLists()).subscribe(
      optionList => {
        if (optionList) {
          this.addOption(Object.keys(optionList)[0]);
        }
      }
    );
  }

  // onAddOptionClose(optionList) {
  //   this.updateSection(this.sections.manageMeal);
  //   if (optionList) {
  //     this.addOption(Object.keys(optionList)[0]);
  //   }
  // }

  addSelection(optionIndex) {
    const optionControls = this.getMealOptionControls();
    const currentValue = optionControls[optionIndex].get('opLimit').value;
    optionControls[optionIndex].get('opLimit').setValue(currentValue + 1);
  }

  subtractSelection(optionIndex) {
    const optionControls = this.getMealOptionControls();
    const currentValue = optionControls[optionIndex].get('opLimit').value;
    if (currentValue > 0) {
      optionControls[optionIndex].get('opLimit').setValue(currentValue - 1);
    }
  }

  onSubmit() {
    if (!this.addMealForm.valid) {
      return this.addMealForm.markAsDirty();
    }

    this.loading = true;
    this.addMealForm.disable();

    const handleErr = err => {
      console.log(err)
      this.loading = false;
      this.addMealForm.enable();
    }

    if (this.mealToEdit) {
      if (this.images) {
        forkJoin(this.uploadImages(this.mealToEdit.id)).subscribe(
          results => {
            if (results) {
              this.menuService.editMeal({
                ... this.addMealForm.value,
                id: this.mealToEdit.id,
                picPathBig: results[0],
                picPathSmall: results[1]
              }).then(
                updatedMeal => {
                  this.mealEdited.emit(updatedMeal);
                  this.close.emit();
                }, err => handleErr(err)
              );
            }
          }, err => handleErr(err)
        );
      } else {
        this.menuService.editMeal({
          ...this.addMealForm.value,
          id: this.mealToEdit.id,
        }).then(
          updatedMeal => {
            this.mealEdited.emit(updatedMeal);
            this.close.emit();
          }, err => handleErr(err)
        )
      }
    } else {
      if (this.images) {
        this.menuService.getMaxMealIndex().subscribe(
          maxMealIndex => {
            const newMealId =`${this.user.email.split('@')[0]}${maxMealIndex + 1}`;
            forkJoin(this.uploadImages(newMealId)).subscribe(
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
                    }, err => handleErr(err)
                  );
                }
              }, err => handleErr(err)
            );
          }
        );
      } else {
        this.menuService.addMeal(this.addMealForm.value).subscribe(
          newMeal => {
            this.mealAdded.emit(newMeal);
            this.close.emit();
          }, err => handleErr(err)
        );
      }
    }
  }

  get imgSet() {
    return this.mealToEdit?.picPathBig || this.images;
  }

  ngOnDestroy() {
    this.destroy$.next(null);
  }
}
