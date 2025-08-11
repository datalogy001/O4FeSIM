import { Component, OnInit } from '@angular/core';
import { Platform, NavController, ModalController } from "@ionic/angular";
import { ServicesService } from '../api/services.service';
import { Router, NavigationExtras } from '@angular/router';
import OneSignalPlugin from 'onesignal-cordova-plugin';
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
    //Notification Permission Popup 
    this.platform.ready().then(() => {
      if (this.platform.is('android') || this.platform.is('ios')) {
        OneSignalPlugin.setAppId('aae08e91-b9cb-455f-885c-7b77073bcd41');
      }
    });     
   this.tempDetails = this.Router.getCurrentNavigation()?.extras.state;
    this.cashBackRes = this.tempDetails.cashbackRes;
     // Fetch and store bundles after login
     this.accessToken = window.localStorage.getItem('Or4esim_auth_token');

      //Check for Push notification 
      this.allowPopupPushNoti();
      //End 
    
  }

  async allowPopupPushNoti() {
    const notiSetting = window.localStorage.getItem('eSIM_IsNotiSettingAllow');
    // Check if permission has not been previously granted
    if (notiSetting === 'no' || notiSetting === null) {
      if (this.platform.is('android') || this.platform.is('ios')) {
        // Prompt the user for push notification permission
        OneSignalPlugin.promptForPushNotificationsWithUserResponse((accepted) => {
          if (accepted) {
            window.localStorage.setItem('eSIM_IsNotiSettingAllow', 'yes');
            // Only fetch device token if the user has accepted
            this.getDeviceToken();
          }
        });
      }
    } else {
      // If permission was previously granted, directly fetch the device token
      this.getDeviceToken();
    }
  }

// Fetch the device token
getDeviceToken() {
  setTimeout(() => {
    OneSignalPlugin.getDeviceState((response) => {
      try {
        const storedPlayerId = window.localStorage.getItem('Or4esim_PLAYER_ID');
        const playerId = storedPlayerId ?? response.userId;
        if (playerId) {
          window.localStorage.setItem('Or4esim_PLAYER_ID', playerId);
          this.updatePlayerId(playerId);
        }
      } catch (error) {
        console.error('Error fetching device token:', error);
      }
    });
  }, 500);
}  

userDetails:any=[]; 

pushDBToken: any = { 'deviceToken': '', 'userid': '' };

updatePlayerId(pushToken: any) {

  //Update token in db 
  if (this.accessToken != null) {

    this.userDetails = window.localStorage.getItem('Or4esim_userDetails');
    this.userDetails = JSON.parse(this.userDetails);
    this.pushDBToken.deviceToken = pushToken;
    this.pushDBToken.userid = this.userDetails.id;
    
    this.service.addPlayerId(this.pushDBToken, this.accessToken).then((res: any) => {
      if (res.code == 200) {
        console.log("Added player id");
      }
      else {
        console.log("unable to add player id");
      }
    }).catch(err => {
      console.log("Something went wrong");
    })
    //End 
  }
}
  async installLater()
  {
    this.navCtrl.navigateRoot('tab1');
  }


}
