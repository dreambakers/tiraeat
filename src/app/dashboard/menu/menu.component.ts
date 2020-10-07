import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
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
  ]

  constructor() { }

  ngOnInit(): void {
  }

}
