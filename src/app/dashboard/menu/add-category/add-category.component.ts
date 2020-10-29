import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { MenuService } from 'src/app/services/menu.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss'],
})
export class AddCategoryComponent implements OnInit {
  @Output() close = new EventEmitter();
  @Output() updateCommon = new EventEmitter();
  @Output() categoryEdited = new EventEmitter();
  @Input() commonObj;
  @Input() categoryToEdit;
  addCategoryForm: FormGroup;

  constructor(
    private menuService: MenuService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.addCategoryForm = this.formBuilder.group({
      name: [
        this.categoryToEdit?.name || '',
        [Validators.required]
      ],
    });
  }

  onSubmit() {
    if (!this.addCategoryForm.valid) {
      return this.addCategoryForm.markAsDirty();
    }

    let updatedCommonObject;
    const categoryName = this.addCategoryForm.value['name'];

    // if editing an existing category
    if (this.categoryToEdit) {
      updatedCommonObject = {
        ...this.commonObj
      };

      const categoryToEditIndex = updatedCommonObject.mealsCategoriesOrder.findIndex(
        category => category === this.categoryToEdit.name
      );

      updatedCommonObject.mealsCategoriesOrder[categoryToEditIndex] = categoryName;

      this.menuService.updateCategory(this.categoryToEdit.meals, updatedCommonObject, categoryName).then(
        res => {
          this.categoryEdited.emit({
            oldName: this.categoryToEdit.name,
            newName: categoryName
          });
          this.close.emit();
        }
      );
    }

    // New category being added
    else {
      if (this.commonObj.mealsCategoriesOrder) {
        // category being added to existing list
          updatedCommonObject = {
            ...this.commonObj,
            mealsCategoriesOrder: [
              ...this.commonObj.mealsCategoriesOrder,
              categoryName,
            ],
          };
      }
      // first category being added
      else {
        updatedCommonObject = {
          ...this.commonObj,
          mealsCategoriesOrder: [categoryName],
        };
      }

      this.menuService
      .updateCommonObject({ mealsCategoriesOrder: updatedCommonObject.mealsCategoriesOrder })
      .subscribe((res) => {
        this.updateCommon.emit({ ...updatedCommonObject });
        this.close.emit();
      });
    }
  }
}
