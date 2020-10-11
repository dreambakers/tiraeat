import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';
import { DialogService } from '../services/dialog.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(
    public translate: TranslateService,
    private authService: AuthService,
    private dialogService: DialogService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  logout() {
    this.dialogService.confirm('messages.areYouSure', 'messages.logoutConfirmation').subscribe(
      res => {
        if (res) {
          this.authService.logout().then(
            res => {
              this.router.navigate(['']);
            }
          )
        }
      }
    );
  }

}
