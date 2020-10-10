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
      mealCat: [this.category]
    });

  }

  onSubmit() {
    this.menuService.addMeal(this.addMealForm.value).subscribe(
      res => {
        console.log(res)
      }
    )
  }
}
