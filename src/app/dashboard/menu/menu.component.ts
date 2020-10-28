import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  trigger,
  transition,
  style,
  animate,
  state,
} from '@angular/animations';
import { MenuService } from '../../services/menu.service';
import { take, takeUntil } from 'rxjs/operators';
import { DialogService } from 'src/app/services/dialog.service';
import { Observable, Subject } from 'rxjs';
import { EmitterService } from 'src/app/services/emitter.service';
import { constants } from 'src/app/app.constants';

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
export class MenuComponent implements OnInit, OnDestroy {

  constants = constants;
  menu;
  addMealCategory;

  editMode = false;

  sections = {
    menu: 'menu',
    manageCategory: 'manageCategory',
    manageMeal: 'manageMeal',
    drinks: 'drinks'
  }
  section = this.sections.menu;

  loading = false;
  categoryToEdit; // category to edit
  mealToEdit;     // meal to edit
  commonObj;
  categoriesMealsMap = {};
  drinksCount = 0;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private dialogService: DialogService,
    private menuService: MenuService,
    private emitterService: EmitterService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.menuService.getMenu().pipe(take(1)).subscribe((menu: any) => {
      this.menu = menu;
      for (let meal of menu) {
        if (meal.isCommon) {
          this.drinksCount = meal.drinks?.length || 0;
          continue;
        }

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

    this.emitterService.emitter.pipe(takeUntil(this.destroy$)).subscribe((emitted) => {
      switch(emitted.event) {
        case constants.emitterKeys.drinksUpdated:
          return this.drinksCount = emitted.data;

        case constants.emitterKeys.tabChanged:
          // if details tab selected
          if (emitted.data == 1 && this.editMode) {
            this.editMode = false;
            this.updateSection(this.sections.menu);
            // call to update any ordering change in db
            this.submit();
          }
          return;
      }
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

  clearMenu() {
    this.editMode = false;
    this.dialogService.confirm(
      'messages.areYouSure', 'messages.clearMenuConfirmation'
    ).subscribe(
      res => {
        if (res) {
          this.menuService.clearMenu().subscribe(
            res1 => {
              window.location.reload();
            }
          );
        }
      }
    );
  }

  submit() {
    this.loading = true;
    // Update the positionByCat value for all meals
    Object.values(this.categoriesMealsMap).forEach((mealArr: any[]) => {
      mealArr.forEach((meal: any, index) => {
        mealArr[index] = { ...meal, positionByCat: index + 1 };
      });
    });

    // flaten array
    const meals = [].concat(...Object.values(this.categoriesMealsMap))
    // pick out drinks from commonObj, since we don't want to edit it
    let { drinks, ..._commonObj } = this.commonObj;
    this.menuService.updateMenu(meals, _commonObj).then(
      res => {
        this.editMode = false;
      }
    ).finally(() => {
      this.loading = false;
    });
  }

  openDrinksDialog() {
    this.dialogService.drinksList().subscribe();
  }

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return !this.editMode && (this.section === this.sections.menu);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
