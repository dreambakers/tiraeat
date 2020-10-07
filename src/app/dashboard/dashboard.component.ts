import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  selectedIndex = 0;
  tabs = [
    {
      title: 'Details',
    },
    {
      title: 'Menu'
    },
    {
      title: 'Another'
    }
  ];

  detailsForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.detailsForm = this.formBuilder.group({
      description: ['', [Validators.required]],
    });
  }

}
