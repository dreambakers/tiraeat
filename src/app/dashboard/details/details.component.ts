import { Component, OnInit, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RestaurantService } from '../../services/restaurant.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { Observable } from 'rxjs';

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
      restDesc: [],
      contactName: [],
      contactNumber: [],
      preparingTime: []
    });
    this.detailsForm.disable();

    this.authService.user.subscribe((user) => {
      this.user = user;
    });

    this.restaurantService.getRestaurant().subscribe((restaurant) => {
      if (restaurant) {
        this.restaurant = restaurant;
        this.populateForm();
      }
    });
  }

  setDayControls() {
    const controls = [];
    for (let day of this.days) {
      controls.push(
        this.formBuilder.group({
          from: '',
          to: '',
          active: true
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
    this.detailsForm.controls['contactNumber'].setValue(this.restaurant.contactNumber);
    this.detailsForm.controls['preparingTime'].setValue(this.restaurant.preparingTime);
    this.detailsForm.controls['contactName'].setValue(this.restaurant.contactName);
    const openHoursControls = this.getDayControls();
    for (let i = 0; i < this.days.length; i ++) {
      openHoursControls[i].setValue({
        from: this.restaurant.openHours[i].split('-')[0].trim(),
        to: this.restaurant.openHours[i].split('-')[1].trim(),
        active: this.restaurant.openHours[i] !== '00:00 - 00:00'
      });
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
    const openHoursControls = this.getDayControls();
    // we need to keep the time fields disabled which have 00:00 - 00:00
    for (let i = 0; i < this.days.length; i ++) {
      if (!openHoursControls[i].get('active').value) {
        openHoursControls[i].get('from').disable({onlySelf: true});
        openHoursControls[i].get('to').disable({onlySelf: true});
      }
    }
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

  getLabelForDay(index) {
    return `days.${this.days[index]}`;
  }

  switchOffHours(event, index) {
    const openHoursControls = this.getDayControls();
    if (!event) {
      openHoursControls[index].get('from').setValue('00:00');
      openHoursControls[index].get('to').setValue('00:00');
      openHoursControls[index].get('from').disable({onlySelf: true});
      openHoursControls[index].get('to').disable({onlySelf: true});
    } else {
      if (this.detailsForm.enabled) {
        openHoursControls[index].get('from').enable();
        openHoursControls[index].get('to').enable();
      }
    }
  }

  onSubmit() {
    const detailsToSubmit = {
      ...this.detailsForm.value
    };

    detailsToSubmit.openHours.forEach(
      (hour, index) => {
        detailsToSubmit.openHours[index] = `${hour.from} - ${hour.to}`
      }
    );

    if (!this.restaurant) {
      this.restaurantService.createRestaurant(detailsToSubmit).subscribe(
        res => {
          console.log(res)
        }
      )
    } else {
      this.restaurantService.updateRestaurant(this.restaurant, {
        ...detailsToSubmit
      });
    }
    this.editMode = false;
    this.detailsForm.disable();
  }

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return !this.editMode;
  }

}
