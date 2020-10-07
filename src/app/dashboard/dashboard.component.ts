import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

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
    public translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.detailsForm = this.formBuilder.group({
      description: ['', [Validators.required]],
    });
  }

}
