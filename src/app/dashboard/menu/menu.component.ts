import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  trigger,
  transition,
  style,
  animate,
  state,
} from '@angular/animations';
import { MenuService } from '../../services/menu.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  animations: [
    trigger('myAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class MenuComponent implements OnInit {
  menu;
  addMealCategory;

  editMode = false;
  addCategory = false;
  addMeal = false;
  commonObj;
  categoriesMealsMap = {};

  constructor(private menuService: MenuService) {}

  ngOnInit(): void {
    this.menuService.getMenu().pipe(take(1)).subscribe((menu: any) => {
      this.menu = menu;

      for (let meal of menu) {
        if (meal?.mealCat in this.categoriesMealsMap) {
          this.categoriesMealsMap[meal.mealCat] = [
            ...this.categoriesMealsMap[meal.mealCat],
            meal,
          ];
        } else {
          this.categoriesMealsMap[meal.mealCat] = [ meal ];
        }
      }

      Object.values(this.categoriesMealsMap).forEach((categoryMeals: any) => {
        categoryMeals.sort(function(meal1: any, meal2: any) {
          return meal1.positionByCat - meal2.positionByCat;
        });
      })
    });

    this.menuService.getCommonObj().subscribe((commonObj) => {
      this.commonObj = commonObj || {};
    });
  }

  onAddMealClick(category) {
    this.addMealCategory = {
      name: category,
      meals: this.categoriesMealsMap[category]
    };
    this.addMeal = true;
  }

  onMealAdded(newMeal) {
    this.categoriesMealsMap[newMeal.mealCat] = [
      ...this.categoriesMealsMap[newMeal.mealCat] || [],
      newMeal
    ];
  }

  dropCategory(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.commonObj?.mealsCategoriesOrder,
      event.previousIndex,
      event.currentIndex
    );
  }

  dropMeal(event: CdkDragDrop<string[]>, category) {
    moveItemInArray(
      this.categoriesMealsMap[category],
      event.previousIndex,
      event.currentIndex
    );
  }

  onCommonUpdate(newObj) {
    this.commonObj = { ...newObj };
  }

  submit() {
    // Update the positionByCat value for all meals
    Object.values(this.categoriesMealsMap).forEach((mealArr: any[]) => {
      mealArr.forEach((meal: any, index) => {
        mealArr[index] = { ...meal, positionByCat: index + 1 };
      });
    });

    // flaten array
    const meals = [].concat(...Object.values(this.categoriesMealsMap))

    this.menuService.updateMenu(meals, this.commonObj).then(
      res => {
        this.editMode = false;
      }
    );
  }
}
