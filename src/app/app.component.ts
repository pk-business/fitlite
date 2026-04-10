import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { UserProfileService } from './services/user-profile.service';
import { ThemeService } from './services/theme.service';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
    imports: [IonicModule],
})
export class AppComponent implements OnInit {
  constructor(
    private userProfileService: UserProfileService,
    private themeService: ThemeService
  ) {}

  async ngOnInit() {
    // Theme service will automatically load saved theme from storage
    // or use system preference on init
  }
}
