import { Component, OnInit, EventEmitter, Output, Input, Inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { MenuService } from 'src/app/services/menu.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-add-option',
  templateUrl: './add-option.component.html',
  styleUrls: ['./add-option.component.scss'],
})
export class AddOptionComponent implements OnInit {
  addOptionsForm: FormGroup;
  addedLists;
  hebrewToEnglishAlphabet = {
    א: 'A',
    ב: 'B',
    ג: 'G',
    ד: 'D',
    ה: 'H',
    ו: 'O',
    ז: 'Z',
    ח: '7',
    ט: 'T',
    י: 'E',
    כ: 'K',
    ך: 'k',
    ל: 'L',
    מ: 'M',
    ם: 'm',
    נ: 'N',
    ן: 'n',
    ס: 'S',
    ע: '3',
    פ: 'P',
    ף: 'p',
    צ: 'X',
    ץ: 'x',
    ק: 'Q',
    ר: 'R',
    ש: '8',
    ת: 't',
    [' ']: '-'
  };
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
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

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
    if (this.selectedMethod === this.methods.addNew) {
      if (!this.addOptionsForm.valid) {
        return this.addOptionsForm.markAsDirty();
      }

      const newListName = this.convertHebrewToEnglish(this.addOptionsForm.controls['name'].value);
      const newOptionList = {
        [newListName]: this.addOptionsForm.controls['items'].value.map(
          item => {
            if (item.price) {
              return { [item.price]: item.name }
            } else {
              return item.name;
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
        this.dialogRef.close({ [this.convertEnglishToHebrew(this.selectedList)]: true });
      }
    }
  }

  convertHebrewToEnglish(value) {
    let converted = '';
    for (let character of value) {
      converted += this.hebrewToEnglishAlphabet[character] || '';
    }
    return converted;
  }

  convertEnglishToHebrew(value) {
    let converted = '';
    const englishToHebrewAlphabet = this.objectFlip(this.hebrewToEnglishAlphabet);
    for (let character of value) {
      converted += englishToHebrewAlphabet[character] || '';
    }
    return converted;
  }

  objectFlip(obj) {
    const ret = {};
    Object.keys(obj).forEach(key => {
      ret[obj[key]] = key;
    });
    return ret;
  }

  getFilteredOptionLists() {
    return this.optionLists.filter(
      list => !this.addedLists.includes(list)
    );
  }
}
