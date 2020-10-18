import { Component, OnInit } from '@angular/core';
import { MenuService } from '../services/menu.service';
import { RestaurantService } from '../services/restaurant.service';
import { AuthService } from '../services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent implements OnInit {

  data = {};
  downloadJsonHref;
  user;

  constructor(
    private menuService: MenuService,
    private restaurantService: RestaurantService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.menuService.getMenu().pipe(take(1)).subscribe(
      res => {
        this.data['menu'] = res;
      }
    );

    this.restaurantService.getRestaurant().pipe(take(1)).subscribe(
      res => {
        this.data['restaurant'] = res;
      }
    );

    this.authService.user.pipe(take(1)).subscribe(
      user => {
        this.user = user;
      }
    );
  }

  generateDownloadJsonUri(myJson) {
    var sJson = JSON.stringify(myJson);
    var element = document.createElement('a');
    element.setAttribute('href', "data:text/json;charset=UTF-8," + encodeURIComponent(sJson));
    element.setAttribute('download', `${this.user.email.split('@')[0]}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click(); // simulate click
    document.body.removeChild(element);
  }
}
