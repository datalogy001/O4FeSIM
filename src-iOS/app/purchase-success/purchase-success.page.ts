
import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { Platform, NavController, ToastController, LoadingController, ModalController } from "@ionic/angular";
import { QrLoaderPage } from '../qr-loader/qr-loader.page';
import { ServicesService } from '../api/services.service';

@Component({
  selector: 'app-purchase-success',
  templateUrl: './purchase-success.page.html',
  styleUrls: ['./purchase-success.page.scss'],
})
export class PurchaseSuccessPage implements OnInit {

  tempDetails: any = [];
  sharingData: any = [];
  iccid: any;
  accessToken: any = '';
  cashBackRes:any=[]; 
  
  constructor(private platform: Platform,  private Router: Router, private modalController: ModalController,private service: ServicesService) { }


  ngOnInit() {
    this.tempDetails = this.Router.getCurrentNavigation()?.extras.state;
    this.sharingData = this.tempDetails.sharingData;
    this.cashBackRes = this.tempDetails.cashbackRes;
    this.iccid = this.tempDetails.iccid;
    this.accessToken = window.localStorage.getItem('Or4esim_auth_token');
    
    setTimeout(() => {
      let navigationExtras: NavigationExtras = {
        state: {
          sharingData: this.sharingData,
          iccid: this.iccid
        }
      };
    this.Router.navigate(['/installation'], navigationExtras);
  }, 2000);

  }

  

userDetails:any=[]; 

pushDBToken: any = { 'deviceToken': '', 'userid': '' };




}
