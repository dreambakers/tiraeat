import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-add-meal',
  templateUrl: './add-meal.component.html',
  styleUrls: ['./add-meal.component.scss']
})
export class AddMealComponent implements OnInit {

  @Output() close:EventEmitter<Boolean> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

}
