import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { MenuService } from 'src/app/services/menu.service';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss'],
})
export class AddCategoryComponent implements OnInit {
  @Output() close: EventEmitter<Boolean> = new EventEmitter();
  @Input() commonObj;
  addCategoryForm;
  categoryIndex;

  constructor(
    private menuService: MenuService,
    private formBuilder: FormBuilder
    ) {}

  ngOnInit(): void {
    console.log(this.commonObj);
    this.addCategoryForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      description: [],
    });
  }

  onSubmit(event) {
    if (this.commonObj.mealsCategoriesOrder) {
      if (this.categoryIndex) {

      } else {
        this.menuService.updateCommonObject({
          ...this.commonObj,
          mealsCategoriesOrder: [
            ...this.commonObj.mealsCategoriesOrder,
            this.addCategoryForm.value['name']
          ]
         }).subscribe();
      }
    } else {
      this.menuService.updateCommonObject({
       ...this.commonObj,
       mealsCategoriesOrder: [
        this.addCategoryForm.value['name']
       ]
      }).subscribe();
    }
  }
}
