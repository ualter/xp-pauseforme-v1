import { Component, OnInit } from '@angular/core';
import { MapPage } from '../map/map.page'
import { SettingPage } from '../setting/setting.page'

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {

  tab1Root = MapPage;
  tab2Root = SettingPage;

  constructor() { }

  ngOnInit() {
  }

}
