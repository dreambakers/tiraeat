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
  @Input() category;
  addMealForm;

  constructor(
    private formBuilder: FormBuilder,
    private menuService: MenuService
  ) { }

  ngOnInit(): void {
    this.addMealForm = this.formBuilder.group({
      mealName: ['', [Validators.required]],
      mealDesc: [],
      price: [],
      mealCat: [this.category.name],
      positionByCat: [this.category.meals.length + 1]
    });
  }

  onSubmit() {
    this.menuService.addMeal(this.addMealForm.value).subscribe(
      newMeal => {
        this.mealAdded.emit(newMeal);
        this.close.emit();
      }
    )
  }
}
