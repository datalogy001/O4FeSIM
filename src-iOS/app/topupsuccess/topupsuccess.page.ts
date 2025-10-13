import { Component, OnInit } from '@angular/core';
import { Platform, NavController, ModalController } from "@ionic/angular";
import { ServicesService } from '../api/services.service';
import { Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-topupsuccess',
  templateUrl: './topupsuccess.page.html',
  styleUrls: ['./topupsuccess.page.scss'],
})
export class TopupsuccessPage implements OnInit {

 tempDetails: any = [];
  sharingData: any = [];
  iccid: any;
  accessToken: any = '';
  cashBackRes:any=[]; 

  constructor(private Router: Router,private platform: Platform, private navCtrl: NavController, private service: ServicesService) { }

  ngOnInit() {
  
   this.tempDetails = this.Router.getCurrentNavigation()?.extras.state;
    this.cashBackRes = this.tempDetails.cashbackRes;
     // Fetch and store bundles after login
     this.accessToken = window.localStorage.getItem('Or4esim_auth_token');
  }

userDetails:any=[]; 

pushDBToken: any = { 'deviceToken': '', 'userid': '' };

  async installLater()
  {
    this.navCtrl.navigateRoot('tab1');
  }


}
