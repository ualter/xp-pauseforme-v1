import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Insomnia } from '@ionic-native/insomnia/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public appPages = [
    {
      title: 'Settings',
      url: '/setting',
      icon: 'cog'
    },
    {
      title: 'PauseForMe',
      url: '/pause-for-me',
      icon: 'pause'
    },
    {
      title: 'Notifications',
      url: '/notification',
      icon: 'notifications'
    }
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private insomnia: Insomnia
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.insomnia.keepAwake()
      .then(
        () => console.log('Insomnia success activated'),
        () => console.log('ERROR: Insomnia attempting activate')
      );
    });
  }
}
