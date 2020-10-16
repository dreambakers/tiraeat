import { Component, OnInit, HostListener } from '@angular/core';
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
import { DialogService } from 'src/app/services/dialog.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  animations: [
    trigger('sectionAnimation', [
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

  sections = {
    menu: 'menu',
    manageCategory: 'manageCategory',
    manageMeal: 'manageMeal'
  }
  section = this.sections.menu;

  loading = false;
  categoryToEdit; // category to edit
  mealToEdit;     // meal to edit
  commonObj;
  categoriesMealsMap = {};

  constructor(
    private dialogService: DialogService,
    private menuService: MenuService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.menuService.getMenu().pipe(take(1)).subscribe((menu: any) => {
      this.menu = menu;
      for (let meal of menu) {
        if (meal.isCommon) { continue; }

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
      });

      this.loading = false;
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
    this.updateSection(this.sections.manageMeal);
  }

  onMealAdded(newMeal) {
    this.categoriesMealsMap[newMeal.mealCat] = [
      ...this.categoriesMealsMap[newMeal.mealCat] || [],
      newMeal
    ];
  }

  onMealEdited(updatedMeal) {
    const updatedMealIndex = this.categoriesMealsMap[updatedMeal.mealCat].findIndex(
      meal => meal.id === updatedMeal.id
    );
    this.categoriesMealsMap[updatedMeal.mealCat][updatedMealIndex] = updatedMeal;
  }

  editMeal(meal) {
    this.mealToEdit = meal;
    this.updateSection(this.sections.manageMeal);
  }

  deleteMeal(meal, category) {
    this.dialogService.confirm(
      'messages.areYouSure',
      'messages.mealDeletionConfirmation'
    ).subscribe(
      res => {
        if (res) {
          this.menuService.deleteMeal(meal).then(
            res => {
              this.categoriesMealsMap[category] = this.categoriesMealsMap[category].filter(
                _meal => _meal.id !== meal.id
              );
            }
          );
        }
      }
    );
  }

  updateSection(section) {
    this.section = this.sections[section];
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

  editCategory(category) {
    this.categoryToEdit = {
      name: category,
      meals: this.categoriesMealsMap[category]
    }
    this.updateSection(this.sections.manageCategory);
  }

  onCategoryEdited(updateObj) {
    const updatedCategoryIndex = this.commonObj.mealsCategoriesOrder.findIndex(
      category => category === updateObj.oldName
    );

    this.commonObj.mealsCategoriesOrder[updatedCategoryIndex] = updateObj.newName;

    if (updateObj.oldName in this.categoriesMealsMap) {
      // in the categoriesMealsMap, we have to update two things:
      // 1. the old cat key which holds the array of meals
      // 2. each of 'mealCat' fields of the meal objects of the array
      this.categoriesMealsMap = {
        ...this.categoriesMealsMap,
        [updateObj.newName]: this.categoriesMealsMap[updateObj.oldName].map(
          meal => ({ ...meal,  mealCat: updateObj.newName })
        )
      };
      delete this.categoriesMealsMap[updateObj.oldName];
    }
  }

  onCommonUpdate(newObj) {
    this.commonObj = { ...newObj };
  }

  deleteCategory(category) {
    this.dialogService.confirm(
      'messages.areYouSure',
      'messages.categoryDeletionConfirmation'
    ).subscribe((res) => {
      if (res) {
        this.menuService.deleteCategory({
          name: category,
          meals: this.categoriesMealsMap[category],
        }, this.commonObj).then(
          res => {
            delete this.categoriesMealsMap[category];
            this.commonObj.mealsCategoriesOrder = this.commonObj.mealsCategoriesOrder.filter(
              cat => cat !== category
            );
          }
        );
      }
    });
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

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return !this.editMode && (this.section === this.sections.menu);
  }
}
