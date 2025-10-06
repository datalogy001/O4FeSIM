import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ServicesService } from '../api/services.service';
import { Router, NavigationExtras } from '@angular/router';
import { ModalController, NavController, Platform } from '@ionic/angular';
import { LoadingScreenAppPage } from '../loading-screen-app/loading-screen-app.page';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { PlanCountryPage } from '../plan-country/plan-country.page';
import {FirebaseAnalytics} from '@ionic-native/firebase-analytics/ngx';



@Component({
  selector: 'app-bundle',
  templateUrl: './bundle.page.html',
  styleUrls: ['./bundle.page.scss'],
})
export class BundlePage implements OnInit {


  constructor( private firebaseAnalytics: FirebaseAnalytics,private platform:Platform, private translate: TranslateService, private loadingScreen: LoadingScreenAppPage, private navController: NavController, private modalController: ModalController, private apiService: ServicesService, private Router: Router, private elementRef: ElementRef) {
  }
  tempData: any = [];
  bundleName: any = '';
  bundleiSO: any = '';
  bundleType: any = '';
  bundleList: any = [];
  currencyCode: any = 'USD';
  isLoading: any = true;
  todaysDate: any = '';
  rate: any = '';
  networkImages: any = [];
  commissionRate:any;
  iccid:any ='';
  paramObj:any = {'iso' : '', 'type': '', 'to_currency':''};
  unlimitedBundles:any=[];
  nonUnlimitedBundles:any=[]; 
  isDataPlan: any= false; 
  userDetails:any=[];
  zoneCountries:any=[]; 
  checkoutObj: any = { 'types':'', 'isUnlimited' : '', 'id': '', 'networkLogos': [], 'networksData': [], 'iccid': '', 'actualAmount': '', 'extraAmount': '', 'currency': '', 'bundleData': [], 'paymentId': '', 'PayerID': '', 'token': '' };
  
  isDestination:any;
  countryName:any; 
  name:any;
  lang:any;
  ngOnInit() {
    this.lang = window.localStorage.getItem("Or4esim_language") || 'en';

    //Get currency 
    if (window.localStorage.getItem("Or4esim_currency") == null) {
      this.currencyCode = 'USD';
      this.paramObj.to_currency =  'USD';
    } else {
      this.currencyCode = window.localStorage.getItem("Or4esim_currency");
      this.paramObj.to_currency = window.localStorage.getItem("Or4esim_currency");
    }
    //Get parameters 
    this.tempData = this.Router.getCurrentNavigation()?.extras.state;
    this.checkoutObj.types = this.tempData.type;
    this.isDestination = this.tempData.isDestinations;
    this.countryName = this.tempData.country_name;
    this.name = this.tempData.name;
    if(this.tempData.type =='country')
    {
    this.bundleName =  this.translate.instant(`COUNTRIES.${this.tempData.iso}`) 
    this.zoneCountries=[];
    }
  else
  { 
  this.zoneCountries = this.tempData.zoneCountries;
  console.log(this.tempData.iso);
  this.bundleName =  this.translate.instant(`ZONES.${this.tempData.iso}`) 
  }

    if (this.tempData.iso == 'North America') {
      this.bundleiSO = 'North_America';
    } else if (this.tempData.iso == 'Middle East') {
      this.bundleiSO = 'Middle_East';
    }  else if (this.tempData.iso == 'CY') {
      this.bundleiSO = 'CY';
    
  }  else if (this.tempData.iso == 'ZM') {
    this.bundleiSO = 'ZM';
  } 
    else {
      this.bundleiSO = this.tempData.iso;
    }

    this.bundleType = this.tempData.type;
    this.paramObj.iso = this.tempData.iso == 'Europe+' ? 'Europe' : this.tempData.iso;
    this.paramObj.type = this.tempData.type;
    this.paramObj.opt = this.tempData.opt;
    this.iccid = this.tempData.iccid;
  
    this.getBundles();
    //this.getListOfImages(this.bundleName);
    if (window.localStorage.getItem('Or4esim_auth_token') != null) {
        this.userDetails = window.localStorage.getItem('Or4esim_userDetails');
      this.userDetails = JSON.parse(this.userDetails);
      this.checkoutObj.id = this.userDetails.id;
    }

  
  
  }

  async gotoPlancountry() {
    const modal = await this.modalController.create({
      component: PlanCountryPage,
      componentProps: { 'countryList':  this.zoneCountries }
      // Ensure modal is presented
    });
   // Manually handle click outside
    document.addEventListener('click', (event) => {
      modal.dismiss();
    });
    modal.onDidDismiss();
    return await modal.present();
  }

  
//Get Bundle List 
async getBundles() {

  await this.loadingScreen.presentLoading();
  this.apiService.getBundleFromDB(this.paramObj).then((res: any) => {
    if (res.data[0].length > 0) {
      this.loadingScreen.dismissLoading();
     // this.isLoading =true;
      this.isDataPlan =true;
      const bundles = res.data[0];
    this.unlimitedBundles = bundles.filter((bundle :any) => bundle.unlimited == true && bundle.price != 0);
    this.nonUnlimitedBundles = bundles.filter((bundle :any) => bundle.unlimited == false);
    } else {
      this.loadingScreen.dismissLoading();
      this.bundleList = [];
    //  this.isLoading =false;
      this.isDataPlan =false;
    }
}).catch(err => {
    this.loadingScreen.dismissLoading();
   // this.isLoading =false;
    this.isDataPlan =false;
  })
}

getBackgroundUrl() {
  return `url('assets/countryBanners/${this.bundleiSO}.jpg') no-repeat center top / cover`;
}

gotoSummary(bundleItem: any, isUnlimited:any) {

  //View Contents 
   if (this.platform.is('android') || this.platform.is('ios')) { 
      this.firebaseAnalytics.logEvent('viewed_plan_details', { plan_id: bundleItem.name });
}

    this.checkoutObj.actualAmount = bundleItem.org_price;
    this.checkoutObj.extraAmount = bundleItem.price;
    this.checkoutObj.currency = this.currencyCode;
    this.checkoutObj.bundleData = bundleItem;
    this.checkoutObj.iccid = this.iccid
    this.checkoutObj.networkLogos = this.networkImages,
    this.checkoutObj.isUnlimited = isUnlimited;

  let navigationExtras: NavigationExtras = {
    state: {
      checkoutData: this.checkoutObj,
      withOutLogin: true
    }
  };

 console.log(JSON.stringify( this.checkoutObj));
 
  if (window.localStorage.getItem('Or4esim_auth_token') != null)
    this.Router.navigate(['/payment-days'], navigationExtras);
  else
    this.Router.navigate(['/login-prompt'], navigationExtras);

}
// gotFAQ()
// {
//   this.Router.navigate(['/faq']);
// }





/*getListOfImages(countryName: any) {
  this.apiService.getListOfImages(countryName).then((res: any) => {
    if (res.data.length > 0) {
      this.networkImages = res.data;
    } else {
      this.networkImages = [];
    }

  }).catch(err => {
    console.log("Something went wrong");
  })
} */

gotoBack() {
  this.navController.pop();
}
  gotoTab5() {
  if(window.localStorage.getItem('Or4esim_auth_token')== null || window.localStorage.getItem('Or4esim_auth_token')== '') 
this.Router.navigate(['tab5']);
else
this.Router.navigate(['profile']);

  }

  gotoMarketPlace()
  {
    this.Router.navigate(['marketplace']);
  }


 gotoTab1()
  {
    this.Router.navigate(['tab1']);
  }

//End of common footers

gotoHomeSearch() {
  this.Router.navigate(['home-search']);
}    

}
