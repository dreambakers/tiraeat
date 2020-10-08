import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss']
})
export class AddCategoryComponent implements OnInit {

  @Output() close:EventEmitter<Boolean> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

}
