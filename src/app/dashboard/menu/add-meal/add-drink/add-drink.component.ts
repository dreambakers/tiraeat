import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { MenuService } from 'src/app/services/menu.service';
import { DialogService } from 'src/app/services/dialog.service';
import { EmitterService } from 'src/app/services/emitter.service';
import { MatDialogRef } from '@angular/material/dialog';
import { constants } from '../../../../app.constants';
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

@Component({
  selector: 'app-add-drink',
  templateUrl: './add-drink.component.html',
  styleUrls: ['./add-drink.component.scss']
})
export class AddDrinkComponent implements OnInit, OnDestroy {

  addDrinkForm: FormGroup;
  drinks = [];
  showSuccessMsg = false;
  listLoading = false;
  loading = false;
  drinksCount;
  constants = constants;

  @Output() close = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private menuService: MenuService,
    private emitterService: EmitterService,
    private dialogService: DialogService,
    public dialogRef: MatDialogRef<AddDrinkComponent>
  ) { }

  ngOnInit(): void {
    this.listLoading = true;

    this.addDrinkForm = this.formBuilder.group({
      drinks: this.formBuilder.array([])
    });

    this.menuService.getCommonObj().subscribe((commonObj: any) => {
      this.listLoading = false;
      this.drinks = commonObj?.drinks || [];
      this.drinksCount = this.drinks.length;
      for (let drink of this.drinks) {
        this.addDrink(drink);
      }
    }, err => {
      this.listLoading = false;
    });

    disableBodyScroll(document.querySelector('#addDrink'));
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
        this.drinksCount = drinks.length;
        this.dialogRef.close();
      }, err => {
        this.loading = false;
      }
    );
  }

  ngOnDestroy(): void {
    clearAllBodyScrollLocks();
    this.emitterService.emit(this.constants.emitterKeys.drinksUpdated, this.drinksCount);
  }
}
