import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MenuService } from 'src/app/services/menu.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import { constants } from 'src/app/app.constants';
import { takeUntil, take } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { EmitterService } from 'src/app/services/emitter.service';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-edit-option',
  templateUrl: './edit-option.component.html',
  styleUrls: ['./edit-option.component.scss'],
})
export class EditOptionComponent implements OnInit, OnDestroy {
  constants = constants;
  editOptionsForm: FormGroup;
  listLoading = false;
  loading = false;
  optionListInUse = true;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private formBuilder: FormBuilder,
    private menuService: MenuService,
    public dialogRef: MatDialogRef<EditOptionComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private emitterService: EmitterService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.listLoading = true;

    this.editOptionsForm = this.formBuilder.group({
      optionLists: this.formBuilder.array([]),
    });

    this.menuService.getMenu().pipe(takeUntil(this.destroy$)).subscribe(
      (meals: any) => {
        this.optionListInUse = meals.some(
          meal => meal.mealOptions && meal.mealOptions.some(
            mealOption => mealOption && mealOption?.opNameEn === this.data.optionKey
          )
        );
      }
    );

    this.menuService.getCommonObj().pipe(take(1)).subscribe((commonObj) => {
      this.listLoading = false;
      const optionListsControls = this.getOptionLists();

      const itemControls = this.formBuilder.array([]);
      for (let item of commonObj[this.data.optionKey]) {
        const name = item && (typeof item === 'object' ? Object.keys(item)[0] : item);
        const price = item && (typeof item === 'object' ? Object.values(item)[0] : '');

        itemControls.push(
          this.formBuilder.group({
            name: [name, [Validators.required]],
            price: [price, [Validators.pattern('^[0-9]+$')]],
            isFlat: typeof item !== 'object'
          })
        )
      }

      optionListsControls.push(
        this.formBuilder.group({
          name: [this.data.optionKey],
          items: itemControls
        })
      );

    }, err => {
      this.listLoading = false;
    });
    disableBodyScroll(document.querySelector('#editOptions'));
  }

  getOptionLists() {
    return (this.editOptionsForm.get('optionLists') as FormArray).controls;
  }

  getItemsForOptionList(optionListIndex) {
    const optionList = this.getOptionLists()[optionListIndex];
    return (optionList.get('items') as FormArray).controls;
  }

  removeItem(optionListIndex, itemIndex) {
    const optionList = this.getOptionLists()[optionListIndex];
    const items = optionList.get('items') as FormArray;
    items.removeAt(itemIndex);
  }

  addItem(optionListIndex) {
    const optionList = this.getOptionLists()[optionListIndex];
    const items = optionList.get('items') as FormArray;

    items.push(
      this.formBuilder.group({
        name: ['', [Validators.required]],
        price: ['', [Validators.pattern('^[0-9]+$')]],
      })
    );
  }

  deleteOptionList() {
    if (!this.optionListInUse) {
      this.dialogService.confirm('messages.areYouSure', 'messages.deleteOptionListConfirmation').subscribe(
        res => {
          if (res) {
            this.menuService.getCommonObj().pipe(take(1)).subscribe(
              commonObj => {
                delete commonObj[this.data.optionKey];
                this.menuService.deleteOptionList(commonObj).subscribe(
                  res => {
                    this.emitterService.emit(this.constants.emitterKeys.optionDeleted, this.data.optionKey);
                    this.dialogRef.close()
                  }
                );
              }
            );
          }
        }
      );
    }
  }

  onSubmit() {

    this.loading = true;

    const optionLists = this.getOptionLists();
    const data = {};

    for (let optionList of optionLists) {

      const listName = optionList.get('name').value;

      data[listName] = [];

      for (let item of optionList.get('items').value) {
        // if item wasn't originally an object, then we maintain it's state by converting it back
        // to a string
        if (item.isFlat && item.price === '') {
          item = item.name;
          data[listName].push(item);
        }

        else {
          // if price for newly added item was not set
          if (item.price === '') {
            item.price = 0;
          }

          data[listName].push({ [item.name]: item.price });
        }
      }
    }

    this.menuService.updateCommonObject(data).pipe(take(1)).subscribe(
      res => {
        this.dialogRef.close();
      }, err => {
        this.loading = false;
      }
    );

  }

  ngOnDestroy() {
    this.destroy$.next(true);
    clearAllBodyScrollLocks();
  }
}
