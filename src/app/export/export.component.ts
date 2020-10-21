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

  data = {};
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

  downloadJsonFiles() {
    var zip = new JSZip();
    zip.file(`${this.user.email.split('@')[0]}_menu.json`, JSON.stringify({ menu: this.data['menu'] }));
    zip.file(`${this.user.email.split('@')[0]}_restaurant.json`, JSON.stringify({ restaurant: this.data['restaurant'] }));

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
