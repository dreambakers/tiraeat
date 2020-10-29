import { Component, OnInit, EventEmitter, Output, Input, Inject, Renderer2, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { MenuService } from 'src/app/services/menu.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import { constants } from 'src/app/app.constants';

@Component({
  selector: 'app-add-option',
  templateUrl: './add-option.component.html',
  styleUrls: ['./add-option.component.scss'],
})
export class AddOptionComponent implements OnInit, OnDestroy {
  constants = constants;
  addOptionsForm: FormGroup;
  addedLists;
  selectedOptions;
  optionLists = [];
  methods = {
    addNew: 'addNew',
    selectExisting: 'selectExisting'
  }
  selectedMethod = this.methods.addNew;
  selectedList;

  constructor(
    private formBuilder: FormBuilder,
    private menuService: MenuService,
    public dialogRef: MatDialogRef<AddOptionComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
  ) {
  }

  ngOnInit(): void {
    this.addedLists = this.data.addedLists;
    this.addOptionsForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.pattern('^[אבגדהוזחטיכךלמםנןסעפףצץקרשת ]+$')]],
      items: this.formBuilder.array([
        this.formBuilder.group({
          name: ['', [Validators.required]],
          price: ['', [Validators.pattern("^[0-9]+$")]]
        })
      ])
    });

    this.menuService.getCommonObj().subscribe(
      commonObj => {
        for (let key of Object.keys(commonObj)) {
          if (Array.isArray(commonObj[key]) && key !== 'mealsCategoriesOrder') {
            this.optionLists.push(key);
          }
        }
      }
    );
    disableBodyScroll(document.querySelector('#addOption'));
  }

  getItemOptions() {
    return (this.addOptionsForm.get('items') as FormArray).controls;
  }

  removeItem(itemIndex) {
    const items = this.addOptionsForm.get('items') as FormArray;
    items.removeAt(itemIndex);
  }

  addItem() {
    const items = this.addOptionsForm.get('items') as FormArray;
    items.push(this.formBuilder.group({
      name: ['', [Validators.required]],
      price: ['', [Validators.pattern("^[0-9]+$")]]
    }));
  }

  onSubmit() {
    const convertHebrewToEnglish = value => {
      let converted = '__';
      for (let character of value) {
        converted += this.constants.hebrewToEnglishAlphabet[character] || '';
      }
      return converted;
    }

    if (this.selectedMethod === this.methods.addNew) {
      if (!this.addOptionsForm.valid) {
        return this.addOptionsForm.markAsDirty();
      }

      const newListName = convertHebrewToEnglish(this.addOptionsForm.controls['name'].value);
      const newOptionList = {
        [newListName]: this.addOptionsForm.controls['items'].value.map(
          item => {
            if (item.price) {
              return { [item.name]: item.price }
            } else {
              return { [item.name]: 0 };
            }
          }
        )
      }

      this.menuService.updateCommonObject(newOptionList).subscribe(
        res => {
          this.dialogRef.close(newOptionList);
        }
      );
    } else {
      if (this.selectedList) {
        this.dialogRef.close({ [this.selectedList]: true });
      }
    }
  }

  getFilteredOptionLists() {
    return this.optionLists.filter(
      list => !this.addedLists.includes(list)
    );
  }

  ngOnDestroy() {
    clearAllBodyScrollLocks();
  }
}
