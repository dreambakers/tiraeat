import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RestaurantService } from '../../services/restaurant.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {

  user;
  restaurant;
  editMode = false;

  constructor(
    public translate: TranslateService,
    private restaurantService: RestaurantService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.user.subscribe((user) => {
      this.user = user;
    })

    this.restaurantService.getRestaurant().subscribe(
      restaurant => {
        if (restaurant) {
          this.restaurant = restaurant;
          console.log(this.restaurant)
        } else {
          console.log('no')
        }
      }
    );
  }

  createRestaurant() {
    this.restaurantService.createRestaurant({
      uid: this.user.uid,
      email: this.user.email
    });
  }

  updateRestaurant() {
    this.restaurantService.updateRestaurant(this.restaurant, { newfield: 'test!' })
  }

}
