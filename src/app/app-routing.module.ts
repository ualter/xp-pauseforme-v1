import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {path: '', redirectTo: 'map', pathMatch: 'full'},

  { path: 'map',          loadChildren: './pages/map/map.module#MapPageModule' },
  { path: 'setting',      loadChildren: './pages/setting/setting.module#SettingPageModule' },
  { path: 'airplane',     loadChildren: './pages/airplane/airplane.module#AirplanePageModule' },
  { path: 'pause-for-me', loadChildren: './pages/pause-for-me/pause-for-me.module#PauseForMePageModule' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
