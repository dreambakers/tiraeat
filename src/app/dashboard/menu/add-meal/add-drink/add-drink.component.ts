import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-drink',
  templateUrl: './add-drink.component.html',
  styleUrls: ['./add-drink.component.scss']
})
export class AddDrinkComponent implements OnInit {

  addDrinkForm;

  @Output() close = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.addDrinkForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      volume: [],
      ingredients: [],
      price: []
    });
  }

  onSubmit() {

  }


}
