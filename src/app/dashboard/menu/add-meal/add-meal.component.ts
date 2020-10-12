import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MenuService } from 'src/app/services/menu.service';

@Component({
  selector: 'app-add-meal',
  templateUrl: './add-meal.component.html',
  styleUrls: ['./add-meal.component.scss']
})
export class AddMealComponent implements OnInit {

  @Output() close:EventEmitter<Boolean> = new EventEmitter();
  @Output() mealAdded:EventEmitter<Boolean> = new EventEmitter();
  @Output() mealEdited = new EventEmitter();
  @Input() category;
  @Input() mealToEdit;

  addMealForm;

  constructor(
    private formBuilder: FormBuilder,
    private menuService: MenuService
  ) { }

  ngOnInit(): void {
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

  onSubmit() {
    if (this.mealToEdit) {
      this.menuService.editMeal({...this.addMealForm.value, id: this.mealToEdit.id}).then(
        updatedMeal => {
          this.mealEdited.emit(updatedMeal);
          this.close.emit();
        }
      );
    } else {
      this.menuService.addMeal(this.addMealForm.value).subscribe(
        newMeal => {
          this.mealAdded.emit(newMeal);
          this.close.emit();
        }
      );
    }
  }
}
