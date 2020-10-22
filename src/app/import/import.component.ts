import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MenuService } from '../services/menu.service';
import { RestaurantService } from '../services/restaurant.service';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss'],
})
export class ImportComponent implements OnInit {
  constructor(
    private menuService: MenuService,
    private restaurantService: RestaurantService
  ) {}

  files = {
    restaurant: null,
    menu: null
  }

  loading = false;
  showSuccess = false;
  showError = false;

  @ViewChild('restInput', { static: true }) restInput: ElementRef;
  @ViewChild('menuInput', { static: true }) menuInput: ElementRef;

  ngOnInit(): void {
  }

  onImportClicked() {
    this.loading = true;
    this.showSuccess = false;
    this.showError = false;
    let promiseArr = [];

    for (let key of Object.keys(this.files)) {
      if (this.files[key]) {
        let files;

        if (key === 'restaurant') {
          files = this.restInput.nativeElement.files;
        } else {
          files = this.menuInput.nativeElement.files;
        }

        const reader = new FileReader();
        promiseArr.push(new Promise((resolve, reject) => {
          reader.onload = (event: any) => {
            try {
              const data = JSON.parse(event.target.result);
              if (data) {
                if (key === 'restaurant') {
                  this.restaurantService.importRestaurant(data).subscribe(
                    res => {
                      resolve({ restaurant: 1 });
                    }, err => {
                      reject({ restaurant: 0 });
                    }
                  )
                } else if (key === 'menu') {
                  this.menuService.bulkAdd(data).subscribe(
                    res => {
                      resolve({ menu: 1 });
                    }, err => {
                      reject({ menu: 0});
                    }
                  )
                }
              }
            } catch (err) {
              reject(err);
            }
          };
          reader.readAsText(files.item(0));
        }))
      }
    }

    Promise.all(promiseArr).then(
      res => {
        this.loading = false;
        this.showSuccess = true;
      }, err => {
        this.loading = false;
        this.showError = true;
      }
    );
  }

  setFile(fileType, event, input) {
    this.files[fileType] = input.files[0];
  }
}
