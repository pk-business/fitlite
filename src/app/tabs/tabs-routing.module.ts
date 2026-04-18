import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('../home/home.module').then((m) => m.HomePageModule),
      },
      {
        path: 'logs',
        loadChildren: () =>
          import('../progress/progress.module').then(
            (m) => m.ProgressPageModule,
          ),
      },
      {
        path: 'exercise',
        loadChildren: () =>
          import('../workout/workout.module').then((m) => m.WorkoutPageModule),
      },
      {
        path: 'diet',
        loadChildren: () =>
          import('../nutrition/nutrition.module').then(
            (m) => m.NutritionPageModule,
          ),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('../profile-tab/profile-tab.module').then(
            (m) => m.ProfileTabPageModule,
          ),
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
