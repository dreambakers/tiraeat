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
  categories = [
    {
      name: 'American Foods',
      items: ['Ham Burger', 'Chicken Submarine', 'Hot Dog'],
    },
    {
      name: 'Italian Foods',
      items: ['Cheese Pasta', 'Pan Pizza', 'Mutton Lasagna'],
    },
    {
      name: 'Chinese Foods',
      items: ['Fried Rice', 'Chinese Noodles', 'Chinese Soup'],
    },
    {
      name: 'Drinks',
      items: ['Baguette', 'Beignet', 'Cannele'],
    },
  ];
  menu;
  addMealCategory;

  editMode = false;
  addCategory = false;
  addMeal = false;
  commonObj;

  constructor(private menuService: MenuService) {}

  ngOnInit(): void {
    this.menuService.getMenu().subscribe((menu) => {
      this.menu = menu;
    });

    this.menuService.getCommonObj().subscribe((commonObj) => {
      this.commonObj = commonObj || {};
    });
  }

  onAddMealClick(category) {
    this.addMealCategory = category;
    this.addMeal = true;
  }

  dropCategory(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.commonObj?.mealsCategoriesOrder, event.previousIndex, event.currentIndex);
  }

  dropItem(event: CdkDragDrop<string[]>, category) {
    moveItemInArray(category.items, event.previousIndex, event.currentIndex);
  }
}
