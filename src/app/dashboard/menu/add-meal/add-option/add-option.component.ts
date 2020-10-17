import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-option',
  templateUrl: './add-option.component.html',
  styleUrls: ['./add-option.component.scss']
})
export class AddOptionComponent implements OnInit {

  addOptionsForm;

  @Output() close = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.addOptionsForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      details: [],
      selections: [0],
      mandatory: [],
      price: []
    });
  }

  onSubmit() {

  }

}
