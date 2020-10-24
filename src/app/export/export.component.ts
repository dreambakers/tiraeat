import { Component, OnInit } from '@angular/core';
import { MenuService } from '../services/menu.service';
import { RestaurantService } from '../services/restaurant.service';
import { AuthService } from '../services/auth.service';
import { take } from 'rxjs/operators';
import * as JSZip from 'jszip';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent implements OnInit {

  menu = {};
  restaurant = {};
  downloadJsonHref;
  user;
  downloaded = false;

  constructor(
    private menuService: MenuService,
    private restaurantService: RestaurantService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.menuService.getMenu().pipe(take(1)).subscribe(
      (menu: any) => {
        for(let meal of menu) {
          if (meal.positionByCat) {
            const mealPost = `${meal.positionByCat}`;
            meal.positionByCat= `${meal.mealCat}${mealPost.padStart(3,'0')}`
          }
          let { id, ..._meal } = meal; // pick out id from meal
          this.menu = {...this.menu, [meal.id]: _meal}
        }
      }
    );

    this.restaurantService.getRestaurant().pipe(take(1)).subscribe(
      restaurant => {
        let { id, ..._restaurant } = restaurant; // pick out id from restaurant
        this.restaurant = { [restaurant.id]: _restaurant }
      }
    );

    this.authService.user.pipe(take(1)).subscribe(
      user => {
        this.user = user;
      }
    );
  }

  downloadJsonFiles() {
    var zip = new JSZip();
    zip.file(`${this.user.email.split('@')[0]}_menu.json`, JSON.stringify(this.menu));
    zip.file(`${this.user.email.split('@')[0]}_restaurant.json`, JSON.stringify(this.restaurant));

    zip.generateAsync({type:"base64"}).then((content) => {
      var element = document.createElement('a');
      element.setAttribute('href', "data:application/zip;base64," + content);
      element.setAttribute('download', `${this.user.email.split('@')[0]}.zip`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click(); // simulate click
      document.body.removeChild(element);
      this.downloaded = true;
    });
  }
}
