import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { MenuService } from 'src/app/services/menu.service';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss'],
})
export class AddCategoryComponent implements OnInit {
  @Output() close = new EventEmitter();
  @Output() updateCommon = new EventEmitter();
  @Input() commonObj;
  addCategoryForm;
  categoryIndex;

  constructor(
    private menuService: MenuService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.addCategoryForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      description: [],
    });
  }

  onSubmit() {
    let updatedCommonObject;

    if (this.commonObj.mealsCategoriesOrder) {
      if (this.categoryIndex) {
      } else {
        updatedCommonObject = {
          ...this.commonObj,
          mealsCategoriesOrder: [
            ...this.commonObj.mealsCategoriesOrder,
            this.addCategoryForm.value['name'],
          ],
        };
      }
    } else {
      updatedCommonObject = {
        ...this.commonObj,
        mealsCategoriesOrder: [this.addCategoryForm.value['name']],
      };
    }

    this.menuService
      .updateCommonObject(updatedCommonObject)
      .subscribe((res) => {
        this.updateCommon.emit({ ...updatedCommonObject });
        this.close.emit();
      });
  }
}
