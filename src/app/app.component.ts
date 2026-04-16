import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ThemeService } from './services/theme.service';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
    imports: [IonicModule],
})
export class AppComponent {
  constructor(private themeService: ThemeService) {
    // ThemeService initializes theme on construction
  }
}
