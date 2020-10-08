import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {trigger, transition, style, animate, state} from '@angular/animations'

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  animations: [
    trigger(
      'myAnimation',
      [
        transition(
        ':enter', [
          style({opacity: 0}),
          animate('500ms', style({'opacity': 1}))
        ]
      ),
      ]
    )
  ],
})
export class MenuComponent implements OnInit {

  categories = [
    {
      name: 'American Foods',
      items: [
        'Ham Burger',
        'Chicken Submarine',
        'Hot Dog'
      ]
    },
    {
      name: 'Italian Foods',
      items: [
        'Cheese Pasta',
        'Pan Pizza',
        'Mutton Lasagna'
      ]
    },
    {
      name: 'Chinese Foods',
      items: [
        'Fried Rice',
        'Chinese Noodles',
        'Chinese Soup'
      ]
    },
    {
      name: 'Drinks',
      items: [
        'Baguette',
        'Beignet',
        'Cannele'
      ]
    }
  ];

  editMode = false;
  addCategory = false;
  addMeal = false;

  constructor() { }

  ngOnInit(): void {
  }

  dropCategory(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.categories, event.previousIndex, event.currentIndex);
  }

  dropItem(event: CdkDragDrop<string[]>, category) {
    moveItemInArray(category.items, event.previousIndex, event.currentIndex);
  }

}
