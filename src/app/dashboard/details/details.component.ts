import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RestaurantService } from '../../services/restaurant.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit {
  user;
  restaurant;
  editMode = false;
  detailsForm: FormGroup;
  days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  constructor(
    public translate: TranslateService,
    private restaurantService: RestaurantService,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.detailsForm = this.formBuilder.group({
      nameUnique: [],
      restPhoneNumber: [],
      openHours: this.formBuilder.array(this.setDayControls()),
      latitude: [],
      longitude: [],
      restDesc: []
    });
    this.detailsForm.disable();

    this.authService.user.subscribe((user) => {
      this.user = user;
    });

    this.restaurantService.getRestaurant().subscribe((restaurant) => {
      if (restaurant) {
        this.restaurant = restaurant;
        // console.log(this.restaurant)
        this.populateForm();
      } else {
        console.log('no');
      }
    });
  }

  setDayControls() {
    const controls = [];
    for (let day of this.days) {
      controls.push(
        this.formBuilder.group({
          day,
          open: '',
        })
      );
    }
    return controls;
  }

  populateForm() {
    this.detailsForm.controls['nameUnique'].setValue(this.restaurant.nameUnique);
    this.detailsForm.controls['restPhoneNumber'].setValue(this.restaurant.restPhoneNumber);
    this.detailsForm.controls['latitude'].setValue(this.restaurant.latitude);
    this.detailsForm.controls['longitude'].setValue(this.restaurant.longitude);
    this.detailsForm.controls['restDesc'].setValue(this.restaurant.restDesc);
    this.detailsForm.controls['restPhoneNumber'].setValue(this.restaurant.restPhoneNumber);
    const openHoursControls = this.getDayControls();
    for (let i = 0; i < this.days.length; i ++) {
      openHoursControls[i].setValue({... this.restaurant.openHours[i]});
    }
  }

  setPosition() {
    navigator.geolocation.getCurrentPosition(
      (resp) => {
        this.detailsForm.controls['latitude'].setValue(resp.coords.longitude);
        this.detailsForm.controls['longitude'].setValue(resp.coords.latitude);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  createRestaurant() {
    this.restaurantService.createRestaurant({
      uid: this.user.uid,
      email: this.user.email,
    });
  }

  enableEditMode() {
    this.editMode = true;
    this.detailsForm.enable();
  }

  getLocationValue() {
    if (this.detailsForm.value['latitude']) {
      return `${this.detailsForm.value['latitude'].toFixed(3)}, ${this.detailsForm.value['longitude'].toFixed(3)}`;
    }
    return '';
  }

  getDayControls() {
    return (this.detailsForm.get('openHours') as FormArray).controls;
  }

  getLabelForDay(control) {
    return `days.${control.value.day}`;
  }

  onSubmit() {
    if (this.restaurant) {
      this.restaurantService.createRestaurant(this.detailsForm.value).subscribe(
        res => {
          console.log(res)
        }
      )
    } else {
      this.restaurantService.updateRestaurant(this.restaurant, {
        ...this.detailsForm.value
      });
    }
    this.editMode = false;
    this.detailsForm.disable();
  }

}
