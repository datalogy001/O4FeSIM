import { Component, OnInit } from '@angular/core';
import { Platform, ModalController, NavController } from '@ionic/angular';
import { ModalRefercodePage } from '../modal-refercode/modal-refercode.page';
import { IonActionSheet, IonButton } from '@ionic/angular/standalone';
import { Router, NavigationExtras } from '@angular/router';
import { ServicesService } from '../api/services.service';
import { TranslateService } from '@ngx-translate/core';
import { LoadingScreenAppPage } from '../loading-screen-app/loading-screen-app.page';
import { ChangeDetectorRef } from '@angular/core';
import { PasswordErrorPage } from '../password-error/password-error.page';
import {FirebaseAnalytics} from '@ionic-native/firebase-analytics/ngx';
@Component({
  selector: 'app-credit-topup',
  templateUrl: './credit-topup.page.html',
  styleUrls: ['./credit-topup.page.scss'],
})
export class CreditTopupPage implements OnInit {

  currencyCode: any = 'USD'; // Default currency
  selectedAmount: any;
  customAmount: any;

  topupAMTList: any = [
    { text: '5', value: 5 },
    { text: '10', value: 10 },
    { text: '20', value: 20 }
  ];


  

 // this is to check for drop down list
topupAMTNewList: any = Array.from({ length: 50 }, (_, i) => ({
  text: (i + 1).toString(),
  value: i + 1
}));

  topupAMTObj: any = {  'status': '', 'amount': '', 'currency': '', 'paymentId': '', 'PayerID': '', 'token': '', 'payment_method':'','payment_intent':''};

  constructor(private platform: Platform,private firebaseAnalytics: FirebaseAnalytics,private cdr: ChangeDetectorRef, private loadingScreen: LoadingScreenAppPage, private modalCtrl: ModalController, private translate: TranslateService, private service: ServicesService, private Router: Router, private modalController: ModalController, private navCtrl: NavController) { }

  ngOnInit() {
    

      if (this.platform.is('android') || this.platform.is('ios')) {
            this.firebaseAnalytics.logEvent('viewed_top_up_options', {});
            }
    //Current currency 
    if (window.localStorage.getItem("Or4esim_currency") == null) {
      this.currencyCode = 'USD';
    } else {
      this.currencyCode = window.localStorage.getItem("Or4esim_currency");
    }

    this.topupAMTObj.currency = this.currencyCode;

  }

  // Placeholder text dynamically updated based on selected currency
  getPlaceholder(): string {
    let placeholderText = '';
    this.translate.get('CHOOSE_ANOTHER_AMOUNT', { currencyCode: this.currencyCode })
      .subscribe((translation: string) => {
        placeholderText = translation;
      });
    return placeholderText;
  }

  onRadioSelect(value: any) {
    this.selectedAmount = value.detail.value;
    this.customAmount = "";
  }

  onChooseRadio() {
    const value = Number(this.customAmount); // Convert input to number
    this.selectedAmount = null;
    if (isNaN(value) || value < 1 || value > 50) {
      this.customAmount = ''; // Clear input if invalid
    }
  }

   // Error Modal
   async errorMSGModal(buttonText: any, msg: any) {
    const modal = await this.modalController.create({
      component: PasswordErrorPage,
      componentProps: { 'value': msg , 'value1': buttonText}
    });

    modal.onDidDismiss();
    return await modal.present();
  }


  onInputChange() {
    const value = Number(this.customAmount); // Convert input to number
    this.selectedAmount = null;
    if (isNaN(value) || value < 1 || value > 50) {
      this.customAmount = ''; // Clear input if invalid
    }
  }

  submit() {
    if (!this.selectedAmount && !this.customAmount) {
      this.errorMSGModal(this.translate.instant('VALIDATION_MSG_BUTTON'), this.translate.instant('SELECT_VALID_AMOUNT'));
      return;
    }
    this.topupAMTObj.amount = this.selectedAmount || this.customAmount;
    const navigationExtras: NavigationExtras = {
      state: {
        topupAMTData: this.topupAMTObj,
      }
    };
    this.Router.navigate(['/payment-topup'], navigationExtras);
  }


  gotoBack() {
    this.navCtrl.pop();
  }

  gotoMarketPlace()
	  {
	    this.navCtrl.navigateRoot('marketplace');
	  }

  gotoTab1() {
    this.navCtrl.navigateRoot('tab1');
  }

}
