import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { MenuService } from 'src/app/services/menu.service';
import { DialogService } from 'src/app/services/dialog.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-drink',
  templateUrl: './add-drink.component.html',
  styleUrls: ['./add-drink.component.scss']
})
export class AddDrinkComponent implements OnInit {

  addDrinkForm: FormGroup;
  drinks = [];
  showSuccessMsg = false;
  loading = false;

  @Output() close = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private menuService: MenuService,
    private dialogService: DialogService,
    public dialogRef: MatDialogRef<AddDrinkComponent>
  ) { }

  ngOnInit(): void {
    this.addDrinkForm = this.formBuilder.group({
      drinks: this.formBuilder.array([])
    });

    this.menuService.getCommonObj().subscribe((commonObj: any) => {
      this.drinks = commonObj?.drinks || [];
      for (let drink of this.drinks) {
        this.addDrink(drink);
      }
    });
  }

  getDrinkControls() {
    return (this.addDrinkForm.get('drinks') as FormArray).controls;
  }

  removeDrink(itemIndex) {
    this.dialogService.confirm('messages.areYouSure', 'messages.deleteDrinkConfirmation').subscribe(
      res => {
        if (res) {
          const drinks = this.addDrinkForm.get('drinks') as FormArray;
          drinks.removeAt(itemIndex);
        }
      }
    );
  }

  addDrink(drink = null) {
    const drinks = this.addDrinkForm.get('drinks') as FormArray;
    drinks.push(this.formBuilder.group({
      name: [drink ? Object.keys(drink)[0] : '', [Validators.required]],
      price: [drink ? Object.values(drink)[0] : '', [Validators.required, Validators.pattern("^[0-9]+$")]],
    }));
  }

  onSubmit() {
    if (!this.addDrinkForm.valid) {
      return this.addDrinkForm.markAsDirty();
    }

    this.loading = true;
    const drinks = [];
    for (let drink of this.addDrinkForm.value['drinks']) {
      drinks.push({ [drink.name]: drink.price });
    }

    this.menuService.updateCommonObject({ drinks }).subscribe(
      res => {
        this.showSuccessMsg = true;
        this.loading = false;
      }, err => {
        this.loading = false;
      }
    );
  }
}
