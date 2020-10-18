import { Component, OnInit } from '@angular/core';
import { MenuService } from '../services/menu.service';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss'],
})
export class ImportComponent implements OnInit {
  constructor(
    private menuService: MenuService
  ) {}

  ngOnInit(): void {
  }

  onImportClicked(input) {
    const files = input.files;
    console.log(files);
    if (files.length <= 0) {
      return false;
    }
    const reader = new FileReader();

    reader.onload = (event: any) => {
      const data = JSON.parse(event.target.result);
      if (data) {
        this.menuService.bulkAdd(data.menu).subscribe(
          res => {
            console.log('done', res);
          }
        )
      }
    };
    reader.readAsText(files.item(0));
  }
}
