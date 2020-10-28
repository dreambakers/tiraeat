import { Component, OnInit, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RestaurantService } from '../../services/restaurant.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { Observable, forkJoin } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { ImgCropperConfig } from '@alyle/ui/image-cropper';
import { StorageService } from 'src/app/services/storage.service';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  animations: [
    trigger('sectionAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class DetailsComponent implements OnInit {
  user;
  restaurant;
  editMode = false;
  loading = false;
  detailsForm: FormGroup;
  days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  sections = {
    details: "details",
    addPhoto: 'addPhoto'
  }
  pictureTypes = {
    logo: 'logo',
    cover: 'cover'
  }
  imagesToUpload = {
    Logo: null,
    Cover: null
  };
  section = this.sections.details;
  logoPic;
  coverPic;
  sourceData;

  constructor(
    public translate: TranslateService,
    private restaurantService: RestaurantService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private storageService: StorageService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.detailsForm = this.formBuilder.group({
      nameUnique: [''],
      restPhoneNumber: ['', [Validators.pattern("^[0-9]{9}$")]],
      openHours: this.formBuilder.array(this.setDayControls()),
      latitude: [''],
      longitude: [''],
      restDesc: [''],
      contactName: ['', [Validators.pattern("^[אבגדהוזחטיכךלמםנןסעפףצץקרשת ]*$")]],
      contactNumber: ['', [Validators.pattern("^[0-9]{10}$")]],
      isClient: [],
      isClosedManually: [],
      positionInGrid: [],
      isAvailable: [],
      isDelivery:[],
      isCredit: [],
      searchTags: [],
      aboutRest: [],
      creditRate: [],
      isCash: [],
      isPickUp: [],
      outerDiscountField: [],
      nameHebInner: [],
      nameHebOuter: [],
      minCookTime: ['', Validators.pattern("^[0-9]*$")],
      maxCookTime: ['', Validators.pattern("^[0-9]*$")],
      isPending: [],
      discountDisc: []
    });
    this.detailsForm.disable();

    this.authService.user.subscribe((user) => {
      this.user = user;
      this.detailsForm.controls['nameUnique'].setValue(user?.email.split('@')[0] || '');
    });

    this.restaurantService.getRestaurant().subscribe((restaurant) => {
      this.loading = false;
      if (restaurant) {
        this.restaurant = restaurant;
        this.logoPic = this.restaurant.logoPath;
        this.coverPic = this.restaurant.repPicPath;
        this.populateForm();
      }
    }, err => {
      this.loading = false;
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
    this.detailsForm.controls['restPhoneNumber'].setValue(this.restaurant.restPhoneNumber || '');
    this.detailsForm.controls['latitude'].setValue(this.restaurant.latitude || '');
    this.detailsForm.controls['longitude'].setValue(this.restaurant.longitude || '');
    this.detailsForm.controls['restDesc'].setValue(this.restaurant.restDesc || '');
    this.detailsForm.controls['contactNumber'].setValue(this.restaurant.contactNumber || '');
    this.detailsForm.controls['contactName'].setValue(this.restaurant.contactName || '');
    this.detailsForm.controls['isClient'].setValue(this.restaurant.isClient || false);
    this.detailsForm.controls['positionInGrid'].setValue(this.restaurant.positionInGrid || 0);
    this.detailsForm.controls['isClosedManually'].setValue(this.restaurant.isClosedManually || false);
    this.detailsForm.controls['isAvailable'].setValue(this.restaurant.isAvailable || true);
    this.detailsForm.controls['isDelivery'].setValue(this.restaurant.isDelivery || true);
    this.detailsForm.controls['searchTags'].setValue(this.restaurant.searchTags || []);
    this.detailsForm.controls['aboutRest'].setValue(this.restaurant.aboutRest || '');
    this.detailsForm.controls['creditRate'].setValue(this.restaurant.creditRate || '');
    this.detailsForm.controls['isCash'].setValue(this.restaurant.isCash || true);
    this.detailsForm.controls['isPickUp'].setValue(this.restaurant.isPickUp || true);
    this.detailsForm.controls['isCredit'].setValue(this.restaurant.isCredit || true);
    this.detailsForm.controls['outerDiscountField'].setValue(this.restaurant.outerDiscountField || '');
    this.detailsForm.controls['nameHebInner'].setValue(this.restaurant.nameHebInner || '');
    this.detailsForm.controls['nameHebOuter'].setValue(this.restaurant.nameHebOuter || '');
    this.detailsForm.controls['minCookTime'].setValue(this.restaurant.minCookTime || '');
    this.detailsForm.controls['maxCookTime'].setValue(this.restaurant.maxCookTime || '');
    this.detailsForm.controls['isPending'].setValue(this.restaurant.isPending || false);
    this.detailsForm.controls['discountDisc'].setValue(this.restaurant.discountDisc || '');
    const openHoursControls = this.getDayControls();
    if (this.restaurant.openHours) {
      for (let i = 0; i < this.days.length; i ++) {
        openHoursControls[i].setValue({
          from: this.restaurant.openHours[i].split('-')[0].trim(),
          to: this.restaurant.openHours[i].split('-')[1].trim(),
          active: this.restaurant.openHours[i] !== '00:00 - 00:00'
        });
      }
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

  clearLocation() {
    this.detailsForm.controls['latitude'].setValue('');
    this.detailsForm.controls['longitude'].setValue('');
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

  addPhoto(type) {
    let cropperConfig: ImgCropperConfig;
    if (type === this.pictureTypes.logo) {
      cropperConfig= {
        keepAspectRatio: true,
        width: 100, // Default `250`
        height: 100, // Default `200`
        // type: 'image/png', // Or you can also use `image/jpeg`,
        output: {
          width: 100,
          height: 100
        },
      }
    } else {
      cropperConfig= {
        keepAspectRatio: true,
        width: 150, // Default `250`
        height: 75, // Default `200`
        // type: 'image/png', // Or you can also use `image/jpeg`,
        output: {
          width: 600,
          height: 300
        },
      }
    }

    this.sourceData = {
      type,
      cropperConfig,
      imgSrc: type === this.pictureTypes.logo ? this.logoPic : this.coverPic
    }
    this.updateSection(this.sections.addPhoto)
  }

  dataURLtoFile(dataurl, filename) {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
  }

  uploadImages() {
    let observables: Observable<string>[] = [];

    for (let key of Object.keys(this.imagesToUpload)) {
      const img = this.imagesToUpload[key];

      if (img) {
        const mediaFolderPath = `${this.user.email.split('@')[0]}/picPath${key}/`;
        const { downloadUrl$, uploadProgress$ } = this.storageService.uploadFileAndGetMetadata(
          mediaFolderPath,
          this.dataURLtoFile(img, `${key}`)
        );
        observables.push(downloadUrl$);
      }
    }
    return observables;
  }

  onAddPhotoClose(event) {
    this.updateSection(this.sections.details);
    if (event?.updated) {
      if (event?.type === 'logo') {
        this.logoPic = event.imgSrc;
        this.imagesToUpload.Logo = event.imgSrc;
      } else if (event?.type === 'cover') {
        this.coverPic = event.imgSrc;
        this.imagesToUpload.Cover = event.imgSrc;
      }
    }
  }

  updateSection(section) {
    this.section = section;
  }

  clearDetails() {
    this.dialogService.confirm(
      'messages.areYouSure', 'messages.clearDetailsConfirmation'
    ).subscribe(
      res => {
        if (res) {
          this.restaurantService.createRestaurant({}).subscribe(
            res1 => {
              window.location.reload();
            }
          );
        }
      }
    );
  }

  onSubmit() {

    if (!this.detailsForm.valid) {
      this.detailsForm.markAsDirty;
      return;
     }

    this.loading = true;
    let detailsToSubmit = {
      ...this.detailsForm.value
    };

    detailsToSubmit['nameHebOuter'] = detailsToSubmit['nameHebInner'];
    detailsToSubmit.openHours.forEach(
      (hour, index) => {
        detailsToSubmit.openHours[index] = `${hour.from}-${hour.to}`
      }
    );

    if (this.imagesToUpload.Logo || this.imagesToUpload.Cover) {
      forkJoin(this.uploadImages()).subscribe(
        results => {
          let resultToImgMap = {};

          if (this.imagesToUpload.Logo) {
            resultToImgMap['logoPath'] = results[0];
          }

          if (this.imagesToUpload.Cover) {
            resultToImgMap['repPicPath'] = this.imagesToUpload.Logo ? results[1] : results[0];
          }

          detailsToSubmit = {
            ...detailsToSubmit,
            ...resultToImgMap
          }
          this.updateOrCreateRestaurant(detailsToSubmit);
        }
      )
    } else {
      this.updateOrCreateRestaurant(detailsToSubmit);
    }
    this.editMode = false;
    this.detailsForm.disable();
  }

  updateOrCreateRestaurant(detailsToSubmit) {
    if (!this.restaurant) {
      this.restaurantService.createRestaurant(detailsToSubmit).subscribe(
        res => {
          this.restaurant = res;
          this.loading = false;
        }, err => {
          this.loading = false;
        }
      )
    } else {
      this.restaurantService.updateRestaurant(this.restaurant, {
        ...detailsToSubmit
      }).then(
        res => {
          this.restaurant = res;
          this.loading = false;
        }, err => {
          this.loading = false;
        }
      );
    }
  }

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return !this.editMode;
  }

}
