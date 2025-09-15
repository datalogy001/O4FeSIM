import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModalController, NavController, ToastController, Platform } from '@ionic/angular';
import { NointernetPage } from '../nointernet/nointernet.page';
import { UpdateAppPage } from '../update-app/update-app.page';
import { PasswordErrorPage } from '../password-error/password-error.page';
import { Router, NavigationExtras } from '@angular/router';
import { IonInfiniteScroll, IonContent } from '@ionic/angular';
import { ServicesService } from '../api/services.service';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { TranslateService } from '@ngx-translate/core';



@Component({
  selector: 'app-home-search',
  templateUrl: './home-search.page.html',
  styleUrls: ['./home-search.page.scss'],
})
export class HomeSearchPage implements OnInit {
  tempISO: any = '';
  allCountriesList: any = [];
  searchTerm: string = '';
  selectedDays: any = '7plusdays';
  tempAllCountry: any = [];
  searchData: any = [];
  tempCountryBundle: any = [];
  isSearch: any = false;
  mainObj: any = [];
  types: any = '';
  currencyCode: any = 'USD';
  iso: any = '';
  isearchIMg: any;
  ignoreScroll: boolean = false; // New flag to ignore scroll events
  @ViewChild(IonContent, { static: false }) content?: IonContent;
  @ViewChild('searchDiv', { static: true }) searchDiv!: ElementRef;
  notificationList: any = [];
  notiCount: any = 0;
  daysFilter: any = [];

  constructor(
    private translate: TranslateService,  private service: ServicesService,
    private platform: Platform,
    private keyboard: Keyboard,
    private router: Router,
    private navController: NavController,
    private modalCtrl: ModalController
  
  ) { }

  destinations:any =[]; 

  async getNotificationList() {
    this.service.getNotificationList(this.tokenValue).then((res: any) => {
      if (res.code == 200) {
        if (res.data.readnotification.length > 0) {
          this.notificationList = res.data.readnotification;
          this.notiCount = res.data.unreadcount;
        }
        else
          this.notificationList = [];
      } else {
        this.notificationList = [];
      }
    }).catch(err => {
      this.notificationList = [];
    })

  }

  gotoNoti() {
    let navigationExtras: NavigationExtras = {
      state: {
        notiData: this.notificationList,
      }
    };
    this.router.navigate(['/notifications'], navigationExtras);
  }


  zoneList:any=[]; 

  ngOnInit() {
 // this.isSelected =false;
 this.langDefault = window.localStorage.getItem('Or4esim_language');

 console.log( this.langDefault);
    this.allCountriesList = window.localStorage.getItem('Or4esim_countryBundles');
this.destinations = window.localStorage.getItem('Or4esim_destinations');
    this.destinations = JSON.parse(this.destinations);
    this.tempAllCountry = JSON.parse(this.allCountriesList);
    this.mainObj = JSON.parse(this.allCountriesList);
  //List of zones
  this.zoneList = window.localStorage.getItem('Or4esim_ZoneBundles');
  this.zoneList = JSON.parse(this.zoneList);

    setTimeout(() => {

const languages = ['en', 'tu'];

Promise.all(languages.map(lang => this.translate.getTranslation(lang).toPromise()))
  .then((translationsArray) => {
    const translationMap: { [lang: string]: { [iso: string]: string } } = {};

    languages.forEach((lang, index) => {
      const countries = (translationsArray[index] as { COUNTRIES?: { [iso: string]: string } })?.COUNTRIES || {};
      translationMap[lang] = countries;
    });

    // Activate selected language
    this.translate.use(this.langDefault).subscribe(() => {
      const currentLang = this.langDefault;

      this.mainObj = this.tempAllCountry.map((country: any) => {
        const iso = country.iso;

        const obj: any = {
          iso: iso,
          region: country.region,
          name: translationMap[currentLang]?.[iso] || iso
        };

        languages.forEach(lang => {
          obj[`country_${lang}_name`] = translationMap[lang]?.[iso] || iso;
        });

        return obj;
      });

      // ✅ Moved inside so it logs correct output
      console.log(JSON.stringify(this.mainObj));
    });
  });

      this.keyboard.hideFormAccessoryBar(false);
    }, 1500);

    this.keyboard.onKeyboardWillShow().subscribe(() => {
      setTimeout(() => {
        this.content?.scrollToPoint(0, 300, 300); // Scroll to a specific point
      }, 300);
    });

    this.keyboard.onKeyboardWillHide().subscribe(() => {
      setTimeout(() => {
        this.content?.scrollToBottom(300); // Adjust as needed when keyboard hides
      }, 300);
    });
  }

  langDefault: any;
  tokenValue:any=0; 
  walletBalance:any=0.00;

  gotoTOpup(){
   
    if(this.tokenValue != null && this.tokenValue != '' )
    {
      this.router.navigate(['/credit-topup']);
    }else{

       let navigationExtras: NavigationExtras = {
      state: {
        checkoutData: this.tempArr,
        withOutLogin: false
      }
    };
      this.router.navigate(['/login'], navigationExtras);
    }
  }

  tempArr:any=[]; 

  ionViewDidEnter() {
     //Current currency 
   //  this.isSelected =false;
     if (window.localStorage.getItem("Or4esim_currency") == null) {
      this.currencyCode = 'USD';
    } else {
      this.currencyCode = window.localStorage.getItem("Or4esim_currency");
    }
    if (window.localStorage.getItem('Or4esim_auth_token') == null) {
      this.tokenValue = 0;
      this.walletBalance=0.00;
          console.log("I m here"+ this.walletBalance);
    }
    else {
      this.tokenValue = window.localStorage.getItem('Or4esim_auth_token');
      this.walletBalance=window.localStorage.getItem('Or4esim_user_wallets');
      console.log(this.walletBalance);
      this.getNotificationList();
    }
    this.searchTerm = '';
    this.searchDiv.nativeElement.classList.remove('searching');
    this.isearchIMg = '';
    this.iso = '';
    this.types = '';
    this.langDefault = window.localStorage.getItem('Or4esim_language');
    
  }

  getWalletClass(): string {
    const balance = parseFloat(this.walletBalance) || 0.00; // Ensure walletBalance is treated as a number
  
    if (balance < 1) {
      return 'tertiary';
    } else if (balance >= 1 && balance < 10) {
      return 'secondary';
    } else {
      return 'primary';
    }
  }


  onFocus() {
    setTimeout(() => {
      this.content?.scrollToPoint(0, 300, 300); // Scroll to a specific point
    }, 300);
  }


afterSearchData: any[] = [];

afterSearch(event: any): boolean {
  this.afterSearchData = this.findMatchingItems(event);
  return this.afterSearchData.length > 0;
}

  gotoFindDeails() {
    if(this.afterSearch(this.searchTerm))
    {
    if (this.searchTerm == '') {
      this.errorMSGModal(this.translate.instant("Ok"), this.translate.instant('CHOOSE_DESTINATION_ERROR'));
    } else {
      
   if (!this.selectedDestination) {
    this.errorMSGModal(
      this.translate.instant('Ok'),
      this.translate.instant('PLEASE_SELECT_DESTINATION')
    );
    return;
  }

      let navigationExtras: NavigationExtras = {
        state: {
          name: this.searchTerm,
          isDestinations:this.isDestinations,
          country_name: this.country_name,
          iso: this.iso,
           type:  this.typeOfCountries,
          iccid: '',
          opt: this.selectedDays,
          zoneCountries: this.zoneCountries,
        }
      };
       this.router.navigate(['bundle-deals'], navigationExtras);
       setTimeout(() => {
        this.searchTerm = '';
        this.searchDiv.nativeElement.classList.remove('searching');
        this.isearchIMg = '';
        this.iso = '';
        this.types = '';
        this.selectedDays = '7plusdays';
     
       }, 200);
    }
  } else
  {
  this.errorMSGModal(this.translate.instant("Ok"), this.translate.instant('NO_DESTINATION_FOUND'));
  }
  }

  //isSelected:any=false;

  onSearch(event: any) {
    this.onFocus();
    const searchTerm: string = event.target.value;
    this.searchData = this.tempAllCountry;

    if (searchTerm) {
      this.searchData = this.findMatchingItems(searchTerm);
      this.isSearch = true;
    } else {
      this.isearchIMg = '';
      this.searchDiv.nativeElement.classList.remove('searching');
      this.isSearch = false;
    }
  }

  onClearSearch() {
    this.isSearch = false;
    this.searchTerm = '';
    this.selectedDestination = null;
    this.iso = '';
    this.isearchIMg = '';
    this.searchDiv.nativeElement.classList.remove('searching');
    this.types = '';
    this.searchData = this.tempAllCountry;
      
  }

 findMatchingItems(searchTerm: string): any[] {
  if (!searchTerm || searchTerm.trim().length < 2) return [];

  const normalize = (text: string) =>
    text.toLowerCase().trim().replace(/\s+/g, ' ');

  const normalizedSearch = normalize(searchTerm);
  const languageFields = ['city_en_name', 'city_tu_name'];
  const appLang = this.langDefault;
  const displayField = `city_${appLang}_name`;

  const matchedItems: any[] = [];
  const seenKeys = new Set<string>();

  // ✅ 1. Match cities
  if (Array.isArray(this.destinations)) {
    for (const item of this.destinations) {
      for (const field of languageFields) {
        const value = item[field];
        if (value && normalize(value).startsWith(normalizedSearch)) {
          const displayName = item[displayField] || item['city_en_name'];
          const key = `${displayName.toLowerCase()}-${item.iso}`;
          if (!seenKeys.has(key)) {
            matchedItems.push({
              ...item,
              cityName: displayName,
              is_destination: true,
              country_name: this.translate.instant(`COUNTRIES.${item.iso}`)
            });
            seenKeys.add(key);
          }
          break;
        }
      }
    }
  }

  // ✅ 2. Match countries
  if (Array.isArray(this.mainObj)) {
    for (const country of this.mainObj) {
      let matchFound = false;

      for (const lang of ['en', 'tu']) {
        const name = country[`country_${lang}_name`];
        if (name && normalize(name).startsWith(normalizedSearch)) {
          matchFound = true;
          break;
        }
      }

      if (matchFound) {
        const displayName = country[`country_${appLang}_name`] || country.name;
        const key = `${country.iso}-${displayName.toLowerCase()}`;
        if (!seenKeys.has(key)) {
          matchedItems.push({
            is_destination: false,
            iso: country.iso,
            name: displayName,
            region: country.region || ''
          });
          seenKeys.add(key);
        }
      }
    }
  }

  console.log('Matched Items:', matchedItems);
  return matchedItems;
}



  typeOfCountries:any;
  zoneCountries:any=[]; 
  isDestinations:any=false;
  country_name:any='';
  zoneFilter(iso: string): string[] {
    const match = this.zoneList.find((zone: any) => zone.iso.toLowerCase() === iso.toLowerCase());
    return match ? match.countries : [];
  }
  
  getLocationLabel(iSO: string): string {
    const regionZones = [
      'africa',
      'global',
      'middle east',
      'oceania',
      'asia',
      'europe+',
      'europe',
      'north america'
    ];
  
    return regionZones.includes(iSO.toLowerCase()) ? 'region' : 'country';
  }

selectedDestination: any = null;
  gotoSelect(name: any, iso: any, type: any, isDestinations:any, country_name:any) {
  //  console.log(name);
 // this.isSelected =true;
  this.selectedDestination = {
    name,
    iso,
    type,
    isDestinations,
    country_name
  };
  this.isDestinations =isDestinations;
  this.country_name = country_name;
  this.typeOfCountries= this.getLocationLabel(iso);
      if (this.typeOfCountries == 'region')
        {
         this.zoneCountries =this.zoneFilter(iso);
         this.isDestinations = false;
        }
        else
        {
         this.isDestinations = isDestinations;
         this.zoneCountries =[];
        }


    this.isSearch = false;
    this.searchTerm = name;
    this.searchDiv.nativeElement.classList.add('searching');
    this.iso = iso;
    this.isearchIMg = iso;
    this.types = type;
  }


  async errorMSGModal(buttonText: any, msg: any) {
    const modal = await this.modalCtrl.create({
      component: PasswordErrorPage,
      componentProps: { 'value': msg, 'value1': buttonText }
    });

    modal.onDidDismiss();
    return await modal.present();
  }

  


  gototab5() {
if(window.localStorage.getItem('Or4esim_auth_token')== null || window.localStorage.getItem('Or4esim_auth_token')== '') 
this.navController.navigateRoot('tab5');
else
this.navController.navigateRoot('profile');
  }

  gototab1() {
    this.navController.navigateRoot('tab1');
  }

  gotoMarketPlace()
  {
    this.navController.navigateRoot('marketplace');
  }
  
  async gotoNointernet() {
    const modal = await this.modalCtrl.create({
      component: NointernetPage
    });

    modal.onDidDismiss();
    return await modal.present();
  }

  async gotoUpdateapp() {
    const modal = await this.modalCtrl.create({
      component: UpdateAppPage
    });

    modal.onDidDismiss();
    return await modal.present();
  }

  onSelectClick() {
    setTimeout(() => {
      this.content?.scrollToBottom(300); // Adjust as needed when keyboard hides
    }, 300);
  }
}
