import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { MenuService } from 'src/app/services/menu.service';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-add-drink',
  templateUrl: './add-drink.component.html',
  styleUrls: ['./add-drink.component.scss']
})
export class AddDrinkComponent implements OnInit {

  addDrinkForm: FormGroup;
  methods = {
    addNew: 'addNew',
    existing: 'existing'
  }
  selectedMethod = this.methods.addNew;
  drinks = [];
  showSuccessMsg = false;
  loading = false;

  @Output() close = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private menuService: MenuService,
    private dialogService: DialogService
  ) { }

  ngOnInit(): void {
    this.addDrinkForm = this.formBuilder.group({
      drinks: this.formBuilder.array([
        this.formBuilder.group({
          name: ['', [Validators.required]],
          price: '',
          // volume: 0,
          // ingredients: ''
        })
      ])
    });

    this.menuService.getCommonObj().subscribe((commonObj: any) => {
      this.drinks = commonObj?.drinks || [];
    });
  }

  getDrinkControls() {
    return (this.addDrinkForm.get('drinks') as FormArray).controls;
  }

  removeDrink(itemIndex) {
    const items = this.addDrinkForm.get('drinks') as FormArray;
    items.removeAt(itemIndex);
  }

  addDrink() {
    const items = this.addDrinkForm.get('drinks') as FormArray;
    items.push(this.formBuilder.group({
      name: ['', [Validators.required]],
      price: '',
      // volume: 0,
      // ingredients: ''
    }));
  }

  deleteDrink(drink) {
    this.dialogService.confirm('messages.areYouSure', 'messages.deleteDrinkConfirmation').subscribe(
      res => {
        if (res) {
          const drinks = this.drinks.filter(_drink => Object.values(_drink)[0] !== Object.values(drink)[0]);
          this.menuService.updateCommonObject({ drinks }).subscribe(
            res => {
              this.drinks = [... drinks];
            }
          )
        }
      }
    )
  }

  onSubmit() {
    if (this.addDrinkForm.valid) {
      this.loading = true;

      const drinks = [...this.drinks];

      for (let drink of this.addDrinkForm.value['drinks']) {
        drinks.push({ [drink.price]: drink.name });
      }

      this.menuService.updateCommonObject({ drinks }).subscribe(
        res => {
          const drinkCtrls = this.addDrinkForm.get('drinks') as FormArray;
          drinkCtrls.clear();
          this.drinks = [...drinks];
          this.showSuccessMsg = true;
          this.loading = false;
        }, err => {
          this.loading = false;
        }
      )
    }
  }
}
