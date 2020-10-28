import { Component, OnInit, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';
import { DialogService } from '../services/dialog.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EmitterService } from '../services/emitter.service';
import { constants } from '../app.constants';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constants = constants;

  constructor(
    public translate: TranslateService,
    private authService: AuthService,
    private dialogService: DialogService,
    private router: Router,
    private emitterService: EmitterService
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

  onTabChanged(event) {
    this.emitterService.emit(this.constants.emitterKeys.tabChanged, event.index);
  }

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return true;
  }
}
